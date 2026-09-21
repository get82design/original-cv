import { prisma } from "../../../lib/prisma";
import { ValidationError } from "../errors";

/** Fenêtres glissantes — import CV gratuit (lecture PDF). */
export const CV_IMPORT_QUOTA = {
	maxPerDay: 2,
	maxPerWeek: 5,
	maxPerMonth: 10,
	dayMs: 24 * 60 * 60 * 1000,
	weekMs: 7 * 24 * 60 * 60 * 1000,
	monthMs: 30 * 24 * 60 * 60 * 1000,
} as const;

export type CvImportQuotaUsage = {
	last24h: number;
	last7d: number;
	last30d: number;
};

function since(ms: number, now: Date) {
	return new Date(now.getTime() - ms);
}

/**
 * Compte les imports PDF réussis (AiEvent IMPORT_CV) sur fenêtres glissantes.
 */
export async function getCvImportQuotaUsage(
	userId: string,
	now = new Date(),
): Promise<CvImportQuotaUsage> {
	const [last24h, last7d, last30d] = await Promise.all([
		prisma.aiEvent.count({
			where: {
				userId,
				feature: "IMPORT_CV",
				createdAt: { gte: since(CV_IMPORT_QUOTA.dayMs, now) },
			},
		}),
		prisma.aiEvent.count({
			where: {
				userId,
				feature: "IMPORT_CV",
				createdAt: { gte: since(CV_IMPORT_QUOTA.weekMs, now) },
			},
		}),
		prisma.aiEvent.count({
			where: {
				userId,
				feature: "IMPORT_CV",
				createdAt: { gte: since(CV_IMPORT_QUOTA.monthMs, now) },
			},
		}),
	]);

	return { last24h, last7d, last30d };
}

/**
 * Refuse avant l’appel Gemini si un plafond est atteint.
 */
export async function assertCvImportQuota(
	userId: string,
	now = new Date(),
): Promise<CvImportQuotaUsage> {
	const usage = await getCvImportQuotaUsage(userId, now);

	if (usage.last24h >= CV_IMPORT_QUOTA.maxPerDay) {
		throw new ValidationError(
			`Limite d’imports atteinte (max ${CV_IMPORT_QUOTA.maxPerDay} / 24 h). Réessaie plus tard ou saisis ton CV à la main.`,
			{ code: "IMPORT_CV_QUOTA", window: "day", usage },
		);
	}
	if (usage.last7d >= CV_IMPORT_QUOTA.maxPerWeek) {
		throw new ValidationError(
			`Limite d’imports atteinte (max ${CV_IMPORT_QUOTA.maxPerWeek} / 7 j). Réessaie plus tard ou saisis ton CV à la main.`,
			{ code: "IMPORT_CV_QUOTA", window: "week", usage },
		);
	}
	if (usage.last30d >= CV_IMPORT_QUOTA.maxPerMonth) {
		throw new ValidationError(
			`Limite d’imports atteinte (max ${CV_IMPORT_QUOTA.maxPerMonth} / 30 j). Réessaie plus tard ou saisis ton CV à la main.`,
			{ code: "IMPORT_CV_QUOTA", window: "month", usage },
		);
	}

	return usage;
}
