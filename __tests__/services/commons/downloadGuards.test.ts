import { describe, expect, it } from "vitest";
import {
	DOWNLOAD_GUARDS,
	assertCvDailyDownloadLimit,
	getCvDownloadGuardStatus,
} from "@/services/user/downloadGuards";
import { ValidationError } from "@/services/errors";
import { prismaTest } from "../../../lib/prismaTest";
import { createTestCV } from "../../utils/create-test-cv";

describe("getCvDownloadGuardStatus", () => {
	it("sans event : pas d’avertissement, plafond non atteint", async () => {
		const { user, cv } = await createTestCV();
		const status = await getCvDownloadGuardStatus(user.id, cv.id);

		expect(status.lastDownloadAt).toBeNull();
		expect(status.recentDownloadWarn).toBe(false);
		expect(status.downloadsLast24h).toBe(0);
		expect(status.dailyLimitReached).toBe(false);
	});

	it("event récent (&lt; 10 min) → recentDownloadWarn", async () => {
		const { user, cv } = await createTestCV();
		const now = new Date("2026-09-27T12:00:00.000Z");
		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITH_LOGO",
				userId: user.id,
				cvId: cv.id,
				createdAt: new Date(now.getTime() - 5 * 60 * 1000),
			},
		});

		const status = await getCvDownloadGuardStatus(user.id, cv.id, now);
		expect(status.recentDownloadWarn).toBe(true);
		expect(status.downloadsLast24h).toBe(1);
	});

	it("event trop vieux (≥ 10 min) → pas d’avertissement", async () => {
		const { user, cv } = await createTestCV();
		const now = new Date("2026-09-27T12:00:00.000Z");
		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITH_LOGO",
				userId: user.id,
				cvId: cv.id,
				createdAt: new Date(now.getTime() - DOWNLOAD_GUARDS.recentWarnMs),
			},
		});

		const status = await getCvDownloadGuardStatus(user.id, cv.id, now);
		expect(status.recentDownloadWarn).toBe(false);
	});

	it("ignore les events d’un autre CV", async () => {
		const { user, cv, template } = await createTestCV();
		const other = await prismaTest.cV.create({
			data: { title: "Autre", userId: user.id, templateId: template.id },
		});
		const now = new Date("2026-09-27T12:00:00.000Z");
		await prismaTest.downloadEvent.create({
			data: {
				variant: "WITH_LOGO",
				userId: user.id,
				cvId: other.id,
				createdAt: new Date(now.getTime() - 60_000),
			},
		});

		const status = await getCvDownloadGuardStatus(user.id, cv.id, now);
		expect(status.recentDownloadWarn).toBe(false);
		expect(status.downloadsLast24h).toBe(0);
	});

	it("dailyLimitReached à partir de 3 DL / 24 h", async () => {
		const { user, cv } = await createTestCV();
		const now = new Date("2026-09-27T12:00:00.000Z");
		for (let i = 0; i < 3; i++) {
			await prismaTest.downloadEvent.create({
				data: {
					variant: i % 2 === 0 ? "WITH_LOGO" : "WITHOUT_LOGO",
					userId: user.id,
					cvId: cv.id,
					createdAt: new Date(now.getTime() - i * 60 * 60 * 1000),
				},
			});
		}

		const status = await getCvDownloadGuardStatus(user.id, cv.id, now);
		expect(status.downloadsLast24h).toBe(3);
		expect(status.dailyLimitReached).toBe(true);
	});
});

describe("assertCvDailyDownloadLimit", () => {
	it("laisse passer sous le plafond", async () => {
		const { user, cv } = await createTestCV();
		await expect(assertCvDailyDownloadLimit(user.id, cv.id)).resolves.toBeUndefined();
	});

	it("refuse le 4ᵉ DL dans la fenêtre 24 h", async () => {
		const { user, cv } = await createTestCV();
		const now = new Date("2026-09-27T12:00:00.000Z");
		for (let i = 0; i < 3; i++) {
			await prismaTest.downloadEvent.create({
				data: {
					variant: "WITH_LOGO",
					userId: user.id,
					cvId: cv.id,
					createdAt: new Date(now.getTime() - i * 60 * 60 * 1000),
				},
			});
		}

		await expect(assertCvDailyDownloadLimit(user.id, cv.id, now)).rejects.toThrow(ValidationError);
		await expect(assertCvDailyDownloadLimit(user.id, cv.id, now)).rejects.toThrow(/3 par 24 h/);
	});
});
