import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createCV } from "../utils/create-test-cv-full-flow";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("admin.listCvs", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.listCvs({ period: "7d" }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("returns CV creations for ADMIN with template and color", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id, "CV Design Feed");

		await prismaTest.cV.update({
			where: { id: cv.id },
			data: { primaryColorName: "emerald" },
		});

		await prismaTest.color.upsert({
			where: { name: "emerald" },
			create: {
				name: "emerald",
				primary: "-600",
				order: Date.now() % 1_000_000_000,
			},
			update: { primary: "-600" },
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const result = await caller.admin.listCvs({
			period: "all",
			page: 1,
			pageSize: 20,
		});

		expect(result.total).toBeGreaterThanOrEqual(1);
		const hit = result.items.find((i) => i.id === cv.id);
		expect(hit).toBeTruthy();
		expect(hit?.title).toBe("CV Design Feed");
		expect(hit?.userEmail).toBe(user.email);
		expect(hit?.templateName).toBe(template.name);
		expect(hit?.primaryColorName).toBe("emerald");
		expect(hit?.colorPrimary).toBe("-600");
	});

	it("filters by templateId and primaryColorName", async () => {
		const user = await createTestUser();
		const templateA = await createTestTemplate();
		const templateB = await createTestTemplate();
		const cvA = await createCV(user.id, templateA.id, "CV A");
		const cvB = await createCV(user.id, templateB.id, "CV B");

		await prismaTest.cV.update({
			where: { id: cvA.id },
			data: { primaryColorName: "blue" },
		});
		await prismaTest.cV.update({
			where: { id: cvB.id },
			data: { primaryColorName: "rose" },
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const byTemplate = await caller.admin.listCvs({
			period: "all",
			templateId: templateA.id,
		});
		expect(byTemplate.items.every((i) => i.templateId === templateA.id)).toBe(
			true,
		);
		expect(byTemplate.items.some((i) => i.id === cvA.id)).toBe(true);
		expect(byTemplate.items.some((i) => i.id === cvB.id)).toBe(false);

		const byColor = await caller.admin.listCvs({
			period: "all",
			primaryColorName: "rose",
		});
		expect(
			byColor.items.every((i) => i.primaryColorName === "rose"),
		).toBe(true);
		expect(byColor.items.some((i) => i.id === cvB.id)).toBe(true);
	});
});

describe("admin.listCvFilters", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(caller.admin.listCvFilters()).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("returns templates and colors for ADMIN", async () => {
		const template = await createTestTemplate();
		await prismaTest.color.upsert({
			where: { name: "indigo" },
			create: {
				name: "indigo",
				primary: "-600",
				order: (Date.now() + 1) % 1_000_000_000,
			},
			update: { primary: "-600" },
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const filters = await caller.admin.listCvFilters();
		expect(filters.templates.some((t) => t.id === template.id)).toBe(true);
		expect(filters.colors.some((c) => c.name === "indigo")).toBe(true);
	});
});

describe("admin.listTopTemplates", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.listTopTemplates({ period: "7d" }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("ranks all templates with free/paid download splits", async () => {
		const user = await createTestUser();
		const templateHot = await createTestTemplate();
		const templateCold = await createTestTemplate();
		await createCV(user.id, templateHot.id, "Hot CV");

		await prismaTest.downloadEvent.createMany({
			data: [
				{
					variant: "WITH_LOGO",
					hadAccount: true,
					userId: user.id,
					templateId: templateHot.id,
				},
				{
					variant: "WITH_LOGO",
					hadAccount: true,
					userId: user.id,
					templateId: templateHot.id,
				},
				{
					variant: "WITHOUT_LOGO",
					hadAccount: true,
					userId: user.id,
					templateId: templateHot.id,
				},
				{
					variant: "WITHOUT_LOGO",
					hadAccount: true,
					userId: user.id,
					templateId: templateCold.id,
				},
			],
		});

		await prismaTest.unlockedTemplate.create({
			data: {
				userId: user.id,
				templateId: templateHot.id,
				method: "CREDITS",
			},
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const byCv = await caller.admin.listTopTemplates({
			period: "all",
			sortBy: "cvCount",
		});
		expect(byCv.some((t) => t.templateId === templateHot.id)).toBe(true);
		expect(byCv.some((t) => t.templateId === templateCold.id)).toBe(true);

		const hot = byCv.find((t) => t.templateId === templateHot.id)!;
		expect(hot.cvCount).toBeGreaterThanOrEqual(1);
		expect(hot.freeDownloadCount).toBe(2);
		expect(hot.paidDownloadCount).toBe(1);
		expect(hot.downloadCount).toBe(3);
		expect(hot.unlockCount).toBe(1);
		// (1 unlock + cvCount + 3 DL) / 3
		expect(hot.popularityScore).toBeCloseTo(
			(1 + hot.cvCount + 3) / 3,
			5,
		);

		const byPop = await caller.admin.listTopTemplates({
			period: "all",
			sortBy: "popularityScore",
		});
		expect(byPop[0]?.templateId).toBe(templateHot.id);

		const byPaid = await caller.admin.listTopTemplates({
			period: "all",
			sortBy: "paidDownloadCount",
		});
		const paidIdx = byPaid.findIndex(
			(t) => t.templateId === templateCold.id,
		);
		const hotPaidIdx = byPaid.findIndex(
			(t) => t.templateId === templateHot.id,
		);
		expect(paidIdx).toBeGreaterThanOrEqual(0);
		expect(hotPaidIdx).toBeGreaterThanOrEqual(0);
		expect(byPaid[paidIdx]!.paidDownloadCount).toBe(1);
		expect(byPaid[hotPaidIdx]!.paidDownloadCount).toBe(1);
	});
});

describe("admin.listTopColors", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.listTopColors({ period: "7d" }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("ranks colors by CV count including catalog zeros", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id, "Color ranked");
		await prismaTest.cV.update({
			where: { id: cv.id },
			data: { primaryColorName: "teal" },
		});
		await prismaTest.color.upsert({
			where: { name: "teal" },
			create: {
				name: "teal",
				primary: "-600",
				order: (Date.now() + 7) % 1_000_000_000,
			},
			update: { primary: "-600" },
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const ranks = await caller.admin.listTopColors({ period: "all" });
		const teal = ranks.find((c) => c.name === "teal");
		expect(teal).toBeTruthy();
		expect(teal?.cvCount).toBeGreaterThanOrEqual(1);
		expect(teal?.primary).toBe("-600");
		expect(ranks[0]!.cvCount).toBeGreaterThanOrEqual(
			ranks[ranks.length - 1]!.cvCount,
		);
	});
});
