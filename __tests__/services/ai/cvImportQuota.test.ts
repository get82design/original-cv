import { describe, expect, it } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import {
	assertCvImportQuota,
	CV_IMPORT_QUOTA,
	getCvImportQuotaUsage,
} from "../../../src/services/ai/cvImportQuota";
import { ValidationError } from "../../../src/services/errors";
import { createTestUser } from "../../utils/create-test-user";

describe("cvImportQuota", () => {
	it("autorise quand aucun import", async () => {
		const user = await createTestUser();
		const usage = await assertCvImportQuota(user.id);
		expect(usage).toEqual({ last24h: 0, last7d: 0, last30d: 0 });
	});

	it("bloque à 2 imports / 24 h", async () => {
		const user = await createTestUser();
		const now = new Date();
		await prismaTest.aiEvent.createMany({
			data: [
				{
					feature: "IMPORT_CV",
					userId: user.id,
					createdAt: new Date(now.getTime() - 60 * 60 * 1000),
				},
				{
					feature: "IMPORT_CV",
					userId: user.id,
					createdAt: new Date(now.getTime() - 30 * 60 * 1000),
				},
			],
		});

		await expect(assertCvImportQuota(user.id, now)).rejects.toBeInstanceOf(ValidationError);
		await expect(assertCvImportQuota(user.id, now)).rejects.toMatchObject({
			message: expect.stringContaining(`max ${CV_IMPORT_QUOTA.maxPerDay} / 24 h`),
		});
	});

	it("bloque à 5 imports / 7 j même si < 2 / 24 h", async () => {
		const user = await createTestUser();
		const now = new Date();
		const day = 24 * 60 * 60 * 1000;
		await prismaTest.aiEvent.createMany({
			data: Array.from({ length: 5 }, (_, i) => ({
				feature: "IMPORT_CV" as const,
				userId: user.id,
				// étalés sur la semaine, 1 seul dans les dernières 24 h
				createdAt: new Date(now.getTime() - (i === 0 ? 1 : i + 1) * day),
			})),
		});

		const usage = await getCvImportQuotaUsage(user.id, now);
		expect(usage.last24h).toBeLessThan(CV_IMPORT_QUOTA.maxPerDay);
		expect(usage.last7d).toBe(5);

		await expect(assertCvImportQuota(user.id, now)).rejects.toMatchObject({
			message: expect.stringContaining(`max ${CV_IMPORT_QUOTA.maxPerWeek} / 7 j`),
		});
	});

	it("bloque à 10 imports / 30 j", async () => {
		const user = await createTestUser();
		const now = new Date();
		const day = 24 * 60 * 60 * 1000;
		// Étalés hors de la fenêtre 7 j (jours 8…26) pour frapper le plafond mois
		await prismaTest.aiEvent.createMany({
			data: Array.from({ length: 10 }, (_, i) => ({
				feature: "IMPORT_CV" as const,
				userId: user.id,
				createdAt: new Date(now.getTime() - (8 + i * 2) * day),
			})),
		});

		const usage = await getCvImportQuotaUsage(user.id, now);
		expect(usage.last24h).toBe(0);
		expect(usage.last7d).toBe(0);
		expect(usage.last30d).toBe(10);

		await expect(assertCvImportQuota(user.id, now)).rejects.toMatchObject({
			message: expect.stringContaining(`max ${CV_IMPORT_QUOTA.maxPerMonth} / 30 j`),
		});
	});

	it("ignore les autres features IA", async () => {
		const user = await createTestUser();
		await prismaTest.aiEvent.createMany({
			data: [
				{ feature: "REVIEW_CV", userId: user.id },
				{ feature: "REWRITE_SECTION", userId: user.id },
			],
		});
		const usage = await getCvImportQuotaUsage(user.id);
		expect(usage.last24h).toBe(0);
	});
});
