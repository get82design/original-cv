import { beforeEach, describe, expect, it } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import { aiBillingService } from "../../../src/services/ai/aiBillingService";
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
}

describe("aiBillingService", () => {
	beforeEach(async () => {
		await ensurePrices();
	});

	it("assertCanPay accepts paid when balance is enough", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 5, freeDownloadsRemaining: 0 },
		});

		const result = await aiBillingService.assertCanPay(
			user.id,
			"REVIEW_CV",
			"paid",
		);
		expect(result).toEqual({ creditsSpent: 2, paymentMethod: "PAID" });
	});

	it("assertCanPay rejects paid when balance is too low", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 1, freeDownloadsRemaining: 10 },
		});

		await expect(
			aiBillingService.assertCanPay(user.id, "REVIEW_CV", "paid"),
		).rejects.toMatchObject({
			message: expect.stringContaining("Crédits payants insuffisants"),
		});
	});

	it("assertCanPay rejects free when feature has no free tariff", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 10 },
		});

		await expect(
			aiBillingService.assertCanPay(user.id, "REVIEW_CV", "free"),
		).rejects.toMatchObject({
			message: expect.stringContaining("n’accepte pas les crédits gratuits"),
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

	it("upsertPrice updates tariffs", async () => {
		const row = await aiBillingService.upsertPrice({
			feature: "COVER_LETTER",
			costFree: 3,
			costPaid: 4,
		});
		expect(row.costFree).toBe(3);
		expect(row.costPaid).toBe(4);
	});
});
