import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import {
	adminDashboardService,
	periodStart,
} from "../../src/services/admin/adminDashboardService";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createCV } from "../utils/create-test-cv-full-flow";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

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
	});

	it("periodStart returns rolling windows and null for all", () => {
		const now = new Date("2026-09-20T12:00:00.000Z");
		expect(periodStart("1d", now).toISOString()).toBe(
			"2026-09-19T12:00:00.000Z",
		);
		expect(periodStart("7d", now).toISOString()).toBe(
			"2026-09-13T12:00:00.000Z",
		);
		expect(periodStart("30d", now).toISOString()).toBe(
			"2026-08-21T12:00:00.000Z",
		);
		expect(periodStart("90d", now).toISOString()).toBe(
			"2026-06-22T12:00:00.000Z",
		);
		expect(periodStart("365d", now).toISOString()).toBe(
			"2025-09-20T12:00:00.000Z",
		);
		expect(periodStart("all", now)).toBeNull();
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
		expect(stats.topTemplates[0]?.count).toBeGreaterThanOrEqual(
			stats.topTemplates[1]?.count ?? 0,
		);
	});
});

describe("admin.router users metrics", () => {
	it("rejects non-admin users", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.admin.dashboardOverview({ period: "7d" }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
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
	});
});
