import { prisma } from "../../../lib/prisma";
import { ValidationError } from "../errors";

/** Garde-fous téléchargement V1 — anti-spam / friction bienveillante. */
export const DOWNLOAD_GUARDS = {
	/** Avertir avant re-débit si dernier DL du CV &lt; 10 min. */
	recentWarnMs: 10 * 60 * 1000,
	/** Plafond glissant ~3 DL / 24 h / CV. */
	maxPerCvPerDay: 3,
	dayMs: 24 * 60 * 60 * 1000,
} as const;

export type CvDownloadGuardStatus = {
	lastDownloadAt: Date | null;
	/** true → modale d’avertissement avant débit. */
	recentDownloadWarn: boolean;
	downloadsLast24h: number;
	dailyLimitReached: boolean;
};

function startOfWindow(ms: number, now: Date) {
	return new Date(now.getTime() - ms);
}

/**
 * Statut garde-fous pour un CV donné (derniers events du user sur ce cvId).
 */
export async function getCvDownloadGuardStatus(
	userId: string,
	cvId: string,
	now = new Date(),
): Promise<CvDownloadGuardStatus> {
	const since24h = startOfWindow(DOWNLOAD_GUARDS.dayMs, now);

	const [last, downloadsLast24h] = await Promise.all([
		prisma.downloadEvent.findFirst({
			where: { userId, cvId },
			orderBy: { createdAt: "desc" },
			select: { createdAt: true },
		}),
		prisma.downloadEvent.count({
			where: { userId, cvId, createdAt: { gte: since24h } },
		}),
	]);

	const lastDownloadAt = last?.createdAt ?? null;
	const recentDownloadWarn =
		lastDownloadAt != null &&
		now.getTime() - lastDownloadAt.getTime() < DOWNLOAD_GUARDS.recentWarnMs;

	return {
		lastDownloadAt,
		recentDownloadWarn,
		downloadsLast24h,
		dailyLimitReached: downloadsLast24h >= DOWNLOAD_GUARDS.maxPerCvPerDay,
	};
}

/** Assert serveur : refuse le 4ᵉ DL dans la fenêtre 24 h. */
export async function assertCvDailyDownloadLimit(
	userId: string,
	cvId: string,
	now = new Date(),
): Promise<void> {
	const since24h = startOfWindow(DOWNLOAD_GUARDS.dayMs, now);
	const count = await prisma.downloadEvent.count({
		where: { userId, cvId, createdAt: { gte: since24h } },
	});
	if (count >= DOWNLOAD_GUARDS.maxPerCvPerDay) {
		throw new ValidationError(
			"Limite de téléchargements atteinte pour ce CV (3 par 24 h). Réessayez plus tard.",
		);
	}
}
