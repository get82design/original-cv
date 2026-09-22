import { describe, expect, it } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import {
	adminDashboardService,
	previousPeriodWindow,
} from "../../../src/services/admin/adminDashboardService";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../../utils/create-test-template";
import { createTestUser } from "../../utils/create-test-user";

describe("previousPeriodWindow", () => {
	it("returns null for all and a mirrored window otherwise", () => {
		const now = new Date("2026-09-21T12:00:00.000Z");
		expect(previousPeriodWindow("all", now)).toBeNull();

		const week = previousPeriodWindow("7d", now);
		expect(week).toEqual({
			start: new Date("2026-09-07T12:00:00.000Z"),
			end: new Date("2026-09-14T12:00:00.000Z"),
		});
	});
});

describe("adminDashboardService.getCvStats previous period", () => {
	it("returns null previous tops and deltas for all-time", async () => {
		const stats = await adminDashboardService.getCvStats("all");
		expect(stats.createdCountDelta).toBeNull();
		expect(stats.templatesUsedDelta).toBeNull();
		expect(stats.previousTopTemplates).toBeNull();
		expect(stats.previousTopColors).toBeNull();
	});

	it("builds previous tops, color shades and deltas vs prior window", async () => {
		const now = new Date("2026-09-21T12:00:00.000Z");
		const day = 24 * 60 * 60 * 1000;
		const user = await createTestUser();
		const currentTpl = await createTestTemplate();
		const previousTpl = await createTestTemplate();

		await prismaTest.color.upsert({
			where: { name: "dashboard-indigo" },
			create: {
				name: "dashboard-indigo",
				primary: "-700",
				order: 9100,
			},
			update: { primary: "-700" },
		});

		// Fenêtre courante (7j) : CV + unlock + DL + couleur
		const currentCv = await createCV(user.id, currentTpl.id, "CV current");
		await prismaTest.cV.update({
			where: { id: currentCv.id },
			data: {
				createdAt: new Date(now.getTime() - 2 * day),
				primaryColorName: "dashboard-indigo",
			},
		});
		await prismaTest.unlockedTemplate.create({
			data: {
				userId: user.id,
				templateId: currentTpl.id,
				unlockedAt: new Date(now.getTime() - 1 * day),
			},
		});
		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITH_LOGO",
				userId: user.id,
				templateId: currentTpl.id,
				createdAt: new Date(now.getTime() - 1 * day),
				primaryColorName: "dashboard-indigo",
			},
		});

		// Fenêtre précédente [now-14j, now-7j)
		const previousCv = await createCV(user.id, previousTpl.id, "CV previous");
		await prismaTest.cV.update({
			where: { id: previousCv.id },
			data: {
				createdAt: new Date(now.getTime() - 10 * day),
				primaryColorName: "ghost-color",
			},
		});
		await prismaTest.unlockedTemplate.create({
			data: {
				userId: user.id,
				templateId: previousTpl.id,
				unlockedAt: new Date(now.getTime() - 10 * day),
			},
		});
		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITHOUT_LOGO",
				userId: user.id,
				templateId: previousTpl.id,
				createdAt: new Date(now.getTime() - 10 * day),
				primaryColorName: "ghost-color",
			},
		});

		const stats = await adminDashboardService.getCvStats("7d", now);

		expect(stats.createdCountDelta).not.toBeNull();
		expect(stats.templatesUsedDelta).not.toBeNull();
		expect(stats.previousTopTemplates).not.toBeNull();
		expect(stats.previousTopColors).not.toBeNull();

		expect(stats.topTemplates.some((t) => t.templateId === currentTpl.id)).toBe(true);
		expect(stats.previousTopTemplates!.some((t) => t.templateId === previousTpl.id)).toBe(true);

		const indigo = stats.topColors.find((c) => c.name === "dashboard-indigo");
		expect(indigo?.primary).toBe("-700");

		const ghost = stats.previousTopColors!.find((c) => c.name === "ghost-color");
		expect(ghost).toBeTruthy();
		expect(ghost!.primary).toBeNull();
	});

	it("falls back to templateId when template row is missing", async () => {
		const now = new Date();
		const user = await createTestUser();
		const orphanId = `orphan-tpl-${Date.now()}`;

		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITH_LOGO",
				userId: user.id,
				templateId: orphanId,
				createdAt: now,
			},
		});

		const stats = await adminDashboardService.getCvStats("7d", now);
		const hit = stats.topTemplates.find((t) => t.templateId === orphanId);
		expect(hit?.name).toBe(orphanId);
	});
});

describe("adminDashboardService AI / API error deltas", () => {
	it("computes AI deltas vs previous period", async () => {
		const now = new Date("2026-09-21T12:00:00.000Z");
		const day = 24 * 60 * 60 * 1000;
		const user = await createTestUser();

		await prismaTest.aiEvent.createMany({
			data: [
				{
					feature: "IMPORT_CV",
					userId: user.id,
					createdAt: new Date(now.getTime() - 1 * day),
				},
				{
					feature: "REVIEW_CV",
					userId: user.id,
					createdAt: new Date(now.getTime() - 10 * day),
				},
			],
		});

		const stats = await adminDashboardService.getAiStats("7d", now);
		expect(stats.totalDelta).not.toBeNull();
		expect(stats.importCvDelta).not.toBeNull();
		expect(stats.reviewCvDelta).not.toBeNull();
		expect(stats.rewriteSectionDelta).not.toBeNull();
		expect(stats.uniqueUsersDelta).not.toBeNull();
		expect(stats.importCv).toBeGreaterThanOrEqual(1);
	});

	it("returns null AI deltas for all-time", async () => {
		const stats = await adminDashboardService.getAiStats("all");
		expect(stats.totalDelta).toBeNull();
		expect(stats.uniqueUsersDelta).toBeNull();
	});

	it("computes API error deltas vs previous period", async () => {
		const now = new Date("2026-09-21T12:00:00.000Z");
		const day = 24 * 60 * 60 * 1000;
		const user = await createTestUser();

		await prismaTest.apiErrorEvent.createMany({
			data: [
				{
					path: "cv.save",
					code: "INTERNAL_SERVER_ERROR",
					message: "now",
					userId: user.id,
					createdAt: new Date(now.getTime() - 1 * day),
				},
				{
					path: "ai.ping",
					code: "TIMEOUT",
					message: "prev",
					userId: user.id,
					createdAt: new Date(now.getTime() - 10 * day),
				},
			],
		});

		const stats = await adminDashboardService.getApiErrorStats("7d", now);
		expect(stats.totalDelta).not.toBeNull();
		expect(stats.internalServerErrorDelta).not.toBeNull();
		expect(stats.tooManyRequestsDelta).not.toBeNull();
		expect(stats.timeoutDelta).not.toBeNull();
		expect(stats.uniqueUsersDelta).not.toBeNull();
	});

	it("returns null API error deltas for all-time", async () => {
		const stats = await adminDashboardService.getApiErrorStats("all");
		expect(stats.totalDelta).toBeNull();
		expect(stats.timeoutDelta).toBeNull();
	});
});
