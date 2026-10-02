import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { adminDashboardService, periodStart } from "../../src/services/admin/adminDashboardService";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("adminDashboardService.getUserStats", () => {
	it("counts new / active / connected for a period", async () => {
		const now = new Date();
		const user = await createTestUser();

		await prismaTest.user.update({
			where: { id: user.id },
			data: {
				createdAt: new Date(now.getTime() - 60 * 60 * 1000),
				lastLoginAt: new Date(now.getTime() - 2 * 60 * 1000),
			},
		});

		const stats = await adminDashboardService.getUserStats("7d", now);
		expect(stats.ready).toBe(true);
		expect(stats.newCount).toBeGreaterThanOrEqual(1);
		expect(stats.activeCount).toBeGreaterThanOrEqual(1);
		expect(stats.connectedCount).toBeGreaterThanOrEqual(1);
		expect(typeof stats.newCountDelta).toBe("number");
		expect(typeof stats.activeCountDelta).toBe("number");
	});

	it("computes delta vs previous period window", async () => {
		const now = new Date("2026-09-21T12:00:00.000Z");
		const day = 24 * 60 * 60 * 1000;

		const currentUser = await createTestUser();
		await prismaTest.user.update({
			where: { id: currentUser.id },
			data: {
				createdAt: new Date(now.getTime() - 2 * day),
				lastLoginAt: new Date(now.getTime() - 1 * day),
			},
		});

		const previousUser = await createTestUser();
		await prismaTest.user.update({
			where: { id: previousUser.id },
			data: {
				createdAt: new Date(now.getTime() - 10 * day),
				lastLoginAt: new Date(now.getTime() - 10 * day),
			},
		});

		const olderUser = await createTestUser();
		await prismaTest.user.update({
			where: { id: olderUser.id },
			data: {
				createdAt: new Date(now.getTime() - 20 * day),
				lastLoginAt: new Date(now.getTime() - 20 * day),
			},
		});

		const stats = await adminDashboardService.getUserStats("7d", now);
		expect(stats.newCountDelta).not.toBeNull();
		expect(stats.activeCountDelta).not.toBeNull();
		// Au moins +1 nouveau (current) vs previous window (previousUser)
		expect(stats.newCount).toBeGreaterThanOrEqual(1);
		expect(stats.newCountDelta!).toBe(
			stats.newCount -
				(await prismaTest.user.count({
					where: {
						createdAt: {
							gte: new Date(now.getTime() - 14 * day),
							lt: new Date(now.getTime() - 7 * day),
						},
					},
				})),
		);
	});

	it("returns null deltas for all-time period", async () => {
		const stats = await adminDashboardService.getUserStats("all");
		expect(stats.newCountDelta).toBeNull();
		expect(stats.activeCountDelta).toBeNull();
	});

	it("periodStart returns rolling windows and null for all", () => {
		const now = new Date("2026-09-20T12:00:00.000Z");
		expect(periodStart("1d", now).toISOString()).toBe("2026-09-19T12:00:00.000Z");
		expect(periodStart("7d", now).toISOString()).toBe("2026-09-13T12:00:00.000Z");
		expect(periodStart("30d", now).toISOString()).toBe("2026-08-21T12:00:00.000Z");
		expect(periodStart("90d", now).toISOString()).toBe("2026-06-22T12:00:00.000Z");
		expect(periodStart("365d", now).toISOString()).toBe("2025-09-20T12:00:00.000Z");
		expect(periodStart("all", now)).toBeNull();
	});
});

describe("adminDashboardService.getDownloadStats", () => {
	it("computes with/without logo deltas vs previous period", async () => {
		const now = new Date("2026-09-21T12:00:00.000Z");
		const day = 24 * 60 * 60 * 1000;
		const user = await createTestUser();

		await prismaTest.downloadEvent.createMany({
			data: [
				{
					variant: "WITH_LOGO",
					userId: user.id,
					createdAt: new Date(now.getTime() - 2 * day),
				},
				{
					variant: "WITHOUT_LOGO",
					userId: user.id,
					createdAt: new Date(now.getTime() - 1 * day),
				},
				{
					variant: "WITH_LOGO",
					userId: user.id,
					createdAt: new Date(now.getTime() - 10 * day),
				},
			],
		});

		const stats = await adminDashboardService.getDownloadStats("7d", now);
		expect(stats.withLogoDelta).not.toBeNull();
		expect(stats.withoutLogoDelta).not.toBeNull();
		expect(stats.withLogoDelta!).toBe(
			stats.withLogo -
				(await prismaTest.downloadEvent.count({
					where: {
						variant: "WITH_LOGO",
						createdAt: {
							gte: new Date(now.getTime() - 14 * day),
							lt: new Date(now.getTime() - 7 * day),
						},
					},
				})),
		);

		const allStats = await adminDashboardService.getDownloadStats("all", now);
		expect(allStats.withLogoDelta).toBeNull();
		expect(allStats.withoutLogoDelta).toBeNull();
	});
});

describe("adminDashboardService.getCvStats", () => {
	it("counts created / existing / templates and top 3", async () => {
		const user = await createTestUser();
		const t1 = await createTestTemplate();
		const t2 = await createTestTemplate();

		await createCV(user.id, t1.id, "CV A");
		await createCV(user.id, t1.id, "CV B");
		await createCV(user.id, t2.id, "CV C");

		const stats = await adminDashboardService.getCvStats("7d");
		expect(stats.ready).toBe(true);
		expect(stats.createdCount).toBeGreaterThanOrEqual(3);
		expect(stats.existingCount).toBeGreaterThanOrEqual(3);
		expect(stats.templatesUsed).toBeGreaterThanOrEqual(2);
		expect(stats.topTemplates.length).toBeGreaterThanOrEqual(1);
		expect(stats.topTemplates[0]?.cvCount).toBeGreaterThanOrEqual(
			stats.topTemplates[1]?.cvCount ?? 0,
		);
		expect(typeof stats.topTemplates[0]?.downloadCount).toBe("number");
		expect(Array.isArray(stats.topColors)).toBe(true);
	});
});

describe("adminDashboardService.getCvStats top templates downloads", () => {
	it("attaches download counts to top templates", async () => {
		const user = await createTestUser();
		const t1 = await createTestTemplate();
		await createCV(user.id, t1.id, "CV DL");

		await prismaTest.downloadEvent.createMany({
			data: [
				{
					variant: "WITH_LOGO",
					userId: user.id,
					templateId: t1.id,
				},
				{
					variant: "WITHOUT_LOGO",
					userId: user.id,
					templateId: t1.id,
				},
			],
		});

		const stats = await adminDashboardService.getCvStats("7d");
		const hit = stats.topTemplates.find((t) => t.templateId === t1.id);
		expect(hit).toBeTruthy();
		expect(hit!.cvCount).toBeGreaterThanOrEqual(1);
		expect(hit!.downloadCount).toBeGreaterThanOrEqual(2);
	});

	it("ranks top colors by popularity (cv + dl) / 2", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.color.upsert({
			where: { name: "emerald" },
			create: { name: "emerald", primary: "-600", order: 9001 },
			update: { primary: "-600" },
		});

		const cv = await createCV(user.id, template.id, "CV emerald");
		await prismaTest.cV.update({
			where: { id: cv.id },
			data: { primaryColorName: "emerald" },
		});
		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITHOUT_LOGO",
				userId: user.id,
				cvId: cv.id,
				primaryColorName: "emerald",
			},
		});

		const stats = await adminDashboardService.getCvStats("7d");
		const hit = stats.topColors.find((c) => c.name === "emerald");
		expect(hit).toBeTruthy();
		expect(hit!.cvCount).toBeGreaterThanOrEqual(1);
		expect(hit!.downloadCount).toBeGreaterThanOrEqual(1);
		expect(hit!.popularityScore).toBe((hit!.cvCount + hit!.downloadCount) / 2);
		expect(hit!.primary).toBe("-600");
	});
});

describe("admin.router users metrics", () => {
	it("rejects non-admin users", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.admin.dashboardOverview({ period: "7d" })).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("returns ready user + cv stats for ADMIN", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		const overview = await caller.admin.dashboardOverview({ period: "7d" });
		expect(overview.period).toBe("7d");
		expect(overview.users.ready).toBe(true);
		expect(typeof overview.users.newCount).toBe("number");
		expect(overview.cvs.ready).toBe(true);
		expect(typeof overview.cvs.createdCount).toBe("number");
		expect(typeof overview.cvs.existingCount).toBe("number");
		expect(Array.isArray(overview.cvs.topTemplates)).toBe(true);
		expect(overview.downloads.ready).toBe(true);
		expect(typeof overview.downloads.total).toBe("number");
		expect(typeof overview.downloads.withLogoAllTime).toBe("number");
		expect(typeof overview.downloads.withoutLogoAllTime).toBe("number");
		expect(typeof overview.downloads.withLogoDelta).toBe("number");
		expect(typeof overview.downloads.withoutLogoDelta).toBe("number");
		expect(overview.ai.ready).toBe(true);
		expect(typeof overview.ai.total).toBe("number");
		expect(typeof overview.ai.importCv).toBe("number");
		expect(typeof overview.ai.uniqueUsers).toBe("number");
		expect(overview.apiErrors.ready).toBe(true);
		expect(typeof overview.apiErrors.total).toBe("number");
		expect(typeof overview.apiErrors.internalServerError).toBe("number");
		expect(typeof overview.apiErrors.tooManyRequests).toBe("number");
	});
});

describe("adminDashboardService.getAiStats", () => {
	it("counts AI events by feature and unique users", async () => {
		const u1 = await createTestUser();
		const u2 = await createTestUser();

		await prismaTest.aiEvent.createMany({
			data: [
				{ feature: "IMPORT_CV", userId: u1.id },
				{ feature: "REVIEW_CV", userId: u1.id },
				{ feature: "REWRITE_SECTION", userId: u2.id, detail: "Profil" },
				{ feature: "COVER_LETTER", userId: u1.id },
				{ feature: "MATCH_JOB", userId: u2.id },
				{ feature: "MATCH_ROME_FICHE", userId: u2.id },
			],
		});

		const stats = await adminDashboardService.getAiStats("7d");
		expect(stats.ready).toBe(true);
		expect(stats.total).toBeGreaterThanOrEqual(6);
		expect(stats.importCv).toBeGreaterThanOrEqual(1);
		expect(stats.reviewCv).toBeGreaterThanOrEqual(1);
		expect(stats.rewriteSection).toBeGreaterThanOrEqual(1);
		expect(stats.coverLetter).toBeGreaterThanOrEqual(1);
		expect(stats.matchJob).toBeGreaterThanOrEqual(1);
		expect(stats.matchRomeFiche).toBeGreaterThanOrEqual(1);
		expect(stats.uniqueUsers).toBeGreaterThanOrEqual(2);
		expect(stats.totalAllTime).toBeGreaterThanOrEqual(6);
	});
});

describe("adminDashboardService.getApiErrorStats", () => {
	it("counts API errors by code and unique users", async () => {
		const u1 = await createTestUser();
		const u2 = await createTestUser();

		await prismaTest.apiErrorEvent.createMany({
			data: [
				{
					path: "cv.save",
					code: "INTERNAL_SERVER_ERROR",
					message: "boom",
					userId: u1.id,
				},
				{
					path: "ai.reviewCv",
					code: "TOO_MANY_REQUESTS",
					message: "429",
					userId: u1.id,
				},
				{
					path: "ai.importCv",
					code: "TIMEOUT",
					message: "slow",
					userId: u2.id,
				},
			],
		});

		const stats = await adminDashboardService.getApiErrorStats("7d");
		expect(stats.ready).toBe(true);
		expect(stats.total).toBeGreaterThanOrEqual(3);
		expect(stats.internalServerError).toBeGreaterThanOrEqual(1);
		expect(stats.tooManyRequests).toBeGreaterThanOrEqual(1);
		expect(stats.timeout).toBeGreaterThanOrEqual(1);
		expect(stats.uniqueUsers).toBeGreaterThanOrEqual(2);
		expect(stats.totalAllTime).toBeGreaterThanOrEqual(3);
	});
});
