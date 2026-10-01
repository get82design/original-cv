import { beforeEach, describe, expect, it } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import { aiBillingService, isBillableAiFeature } from "../../../src/services/ai/aiBillingService";
import { createTestUser } from "../../utils/create-test-user";

async function ensurePrices() {
	await prismaTest.aiFeaturePrice.upsert({
		where: { feature: "REVIEW_CV" },
		create: { feature: "REVIEW_CV", costFree: null, costPaid: 2 },
		update: { costFree: null, costPaid: 2 },
	});
	await prismaTest.aiFeaturePrice.upsert({
		where: { feature: "REWRITE_SECTION" },
		create: { feature: "REWRITE_SECTION", costFree: 2, costPaid: 1 },
		update: { costFree: 2, costPaid: 1 },
	});
	await prismaTest.aiFeaturePrice.upsert({
		where: { feature: "COVER_LETTER" },
		create: { feature: "COVER_LETTER", costFree: null, costPaid: 4 },
		update: { costFree: null, costPaid: 4 },
	});
	await prismaTest.aiFeaturePrice.upsert({
		where: { feature: "MATCH_JOB" },
		create: { feature: "MATCH_JOB", costFree: null, costPaid: 2 },
		update: { costFree: null, costPaid: 2 },
	});
}

describe("aiBillingService", () => {
	beforeEach(async () => {
		await ensurePrices();
	});

	it("isBillableAiFeature distinguishes billable features", () => {
		expect(isBillableAiFeature("REVIEW_CV")).toBe(true);
		expect(isBillableAiFeature("IMPORT_CV")).toBe(false);
	});

	it("listPrices returns all billable features", async () => {
		const prices = await aiBillingService.listPrices();
		expect(prices.map((p) => p.feature)).toEqual([
			"REVIEW_CV",
			"REWRITE_SECTION",
			"COVER_LETTER",
			"MATCH_JOB",
		]);
		expect(prices.find((p) => p.feature === "REVIEW_CV")).toMatchObject({
			costFree: null,
			costPaid: 2,
		});
	});

	it("getBillingOptions exposes balances and canPay flags", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 5, freeDownloadsRemaining: 3 },
		});

		const options = await aiBillingService.getBillingOptions(user.id, "REWRITE_SECTION");
		expect(options).toMatchObject({
			feature: "REWRITE_SECTION",
			costFree: 2,
			costPaid: 1,
			downloadCredits: 5,
			freeDownloadsRemaining: 3,
			canPayFree: true,
			canPayPaid: true,
		});
	});

	it("getBillingOptions rejects non-billable features", async () => {
		const user = await createTestUser();
		await expect(aiBillingService.getBillingOptions(user.id, "IMPORT_CV")).rejects.toMatchObject({
			message: expect.stringContaining("n’est pas facturée"),
		});
	});

	it("assertCanPay accepts paid when balance is enough", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 5, freeDownloadsRemaining: 0 },
		});

		const result = await aiBillingService.assertCanPay(user.id, "REVIEW_CV", "paid");
		expect(result).toEqual({ creditsSpent: 2, paymentMethod: "PAID" });
	});

	it("assertCanPay rejects paid when balance is too low", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 1, freeDownloadsRemaining: 10 },
		});

		await expect(aiBillingService.assertCanPay(user.id, "REVIEW_CV", "paid")).rejects.toMatchObject(
			{
				message: expect.stringContaining("Crédits payants insuffisants"),
			},
		);
	});

	it("assertCanPay rejects free when feature has no free tariff", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 10 },
		});

		await expect(aiBillingService.assertCanPay(user.id, "REVIEW_CV", "free")).rejects.toMatchObject(
			{
				message: expect.stringContaining("n’accepte pas les crédits gratuits"),
			},
		);
	});

	it("assertCanPay rejects free when free balance is too low", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 1 },
		});

		await expect(
			aiBillingService.assertCanPay(user.id, "REWRITE_SECTION", "free"),
		).rejects.toMatchObject({
			message: expect.stringContaining("Crédits gratuits insuffisants"),
		});
	});

	it("assertCanPay rejects paid when feature has no paid tariff", async () => {
		const user = await createTestUser();
		await prismaTest.aiFeaturePrice.upsert({
			where: { feature: "COVER_LETTER" },
			create: {
				feature: "COVER_LETTER",
				costFree: 2,
				costPaid: null,
			},
			update: { costFree: 2, costPaid: null },
		});
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 10 },
		});

		await expect(
			aiBillingService.assertCanPay(user.id, "COVER_LETTER", "paid"),
		).rejects.toMatchObject({
			message: expect.stringContaining("n’accepte pas les crédits payants"),
		});
	});

	it("consumeAndLog decrements free credits and logs event", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 0, freeDownloadsRemaining: 5 },
		});

		await aiBillingService.consumeAndLog({
			userId: user.id,
			feature: "REWRITE_SECTION",
			choice: "free",
			detail: "Profil",
		});

		const refreshed = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(refreshed.freeDownloadsRemaining).toBe(3);
		expect(refreshed.iaRequestsUsed).toBe(1);

		const events = await prismaTest.aiEvent.findMany({
			where: { userId: user.id },
		});
		expect(events).toHaveLength(1);
		expect(events[0]?.feature).toBe("REWRITE_SECTION");
		expect(events[0]?.paymentMethod).toBe("FREE");
		expect(events[0]?.creditsSpent).toBe(2);
		expect(events[0]?.detail).toBe("Profil");
	});

	it("consumeAndLog decrements paid credits without detail", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 5, freeDownloadsRemaining: 0 },
		});

		await aiBillingService.consumeAndLog({
			userId: user.id,
			feature: "REVIEW_CV",
			choice: "paid",
		});

		const refreshed = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(refreshed.downloadCredits).toBe(3);
		expect(refreshed.iaRequestsUsed).toBe(1);

		const events = await prismaTest.aiEvent.findMany({
			where: { userId: user.id },
		});
		expect(events).toHaveLength(1);
		expect(events[0]?.paymentMethod).toBe("PAID");
		expect(events[0]?.creditsSpent).toBe(2);
		expect(events[0]?.detail).toBeNull();
	});

	it("upsertPrice updates tariffs", async () => {
		const row = await aiBillingService.upsertPrice({
			feature: "COVER_LETTER",
			costFree: 3,
			costPaid: 4,
		});
		expect(row.costFree).toBe(3);
		expect(row.costPaid).toBe(4);
	});

	it("upsertPrice rejects invalid tariffs", async () => {
		await expect(
			aiBillingService.upsertPrice({
				feature: "REVIEW_CV",
				costFree: 0,
				costPaid: 2,
			}),
		).rejects.toMatchObject({
			message: "costFree doit être ≥ 1 ou null",
		});

		await expect(
			aiBillingService.upsertPrice({
				feature: "REVIEW_CV",
				costFree: 2,
				costPaid: 0,
			}),
		).rejects.toMatchObject({
			message: "costPaid doit être ≥ 1 ou null",
		});

		await expect(
			aiBillingService.upsertPrice({
				feature: "REVIEW_CV",
				costFree: null,
				costPaid: null,
			}),
		).rejects.toMatchObject({
			message: expect.stringContaining("Au moins un tarif"),
		});
	});
});
