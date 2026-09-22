import type { PrismaClient } from "../../generated/prisma/client";

/** Tarifs IA hors import (crédits free / paid). */
export const SEED_AI_FEATURE_PRICES = [
	{ feature: "REVIEW_CV" as const, costFree: null, costPaid: 2 },
	{ feature: "REWRITE_SECTION" as const, costFree: 2, costPaid: 1 },
	{ feature: "COVER_LETTER" as const, costFree: null, costPaid: 4 },
];

/** Packs vitrine — achat Stripe non branché. */
export const SEED_CREDIT_PACKS = [
	{
		name: "Pack découverte",
		description: "Idéal pour tester l’export sans logo et une relecture.",
		priceCents: 499,
		downloadCredits: 3,
		freeDownloads: 1,
		sortOrder: 10,
		isActive: true,
	},
	{
		name: "Pack standard",
		description: "Pour peaufiner un CV avec plusieurs actions IA.",
		priceCents: 999,
		downloadCredits: 8,
		freeDownloads: 2,
		sortOrder: 20,
		isActive: true,
	},
	{
		name: "Pack pro",
		description: "Lot confort pour plusieurs CV / candidatures.",
		priceCents: 1999,
		downloadCredits: 20,
		freeDownloads: 5,
		sortOrder: 30,
		isActive: true,
	},
];

export async function seedBilling(prisma: PrismaClient) {
	for (const row of SEED_AI_FEATURE_PRICES) {
		await prisma.aiFeaturePrice.upsert({
			where: { feature: row.feature },
			create: {
				feature: row.feature,
				costFree: row.costFree,
				costPaid: row.costPaid,
			},
			update: {
				costFree: row.costFree,
				costPaid: row.costPaid,
			},
		});
	}

	const existingPacks = await prisma.creditPack.count();
	if (existingPacks === 0) {
		await prisma.creditPack.createMany({ data: SEED_CREDIT_PACKS });
	}
}
