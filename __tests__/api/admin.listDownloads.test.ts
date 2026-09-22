import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("admin.listDownloads", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(caller.admin.listDownloads({ period: "7d" })).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("returns download events for ADMIN", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id, "CV Feed");

		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITH_LOGO",
				hadAccount: true,
				userId: user.id,
				cvId: cv.id,
				templateId: template.id,
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

		const result = await caller.admin.listDownloads({
			period: "all",
			page: 1,
			pageSize: 20,
		});

		expect(result.total).toBeGreaterThanOrEqual(1);
		const hit = result.items.find((i) => i.cvTitle === "CV Feed");
		expect(hit).toBeTruthy();
		expect(hit?.variant).toBe("WITH_LOGO");
		expect(hit?.userEmail).toBe(user.email);
		expect(hit?.templateName).toBe(template.name);
		expect(hit?.hadAccount).toBe(true);
	});

	it("filters by variant", async () => {
		const user = await createTestUser();
		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITHOUT_LOGO",
				hadAccount: true,
				userId: user.id,
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

		const paid = await caller.admin.listDownloads({
			period: "all",
			variant: "WITHOUT_LOGO",
		});
		expect(paid.items.every((i) => i.variant === "WITHOUT_LOGO")).toBe(true);

		const free = await caller.admin.listDownloads({
			period: "all",
			variant: "WITH_LOGO",
		});
		expect(free.items.every((i) => i.variant === "WITH_LOGO")).toBe(true);
	});

	it("filters by email search and falls back for unknown templateId", async () => {
		const user = await createTestUser();
		const unique = `dl-search-${Date.now()}`;
		await prismaTest.user.update({
			where: { id: user.id },
			data: { email: `${unique}@test.com` },
		});
		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITH_LOGO",
				hadAccount: true,
				userId: user.id,
				templateId: "orphan-template-id",
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

		const result = await caller.admin.listDownloads({
			period: "all",
			search: unique,
		});
		const hit = result.items.find((i) => i.userId === user.id);
		expect(hit).toBeTruthy();
		expect(hit?.templateName).toBe("orphan-template-id");
	});
});
