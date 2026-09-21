import { z } from "zod";
import { prisma } from "../../../lib/prisma";

export const adminDashboardPeriodSchema = z.enum([
	"1d",
	"7d",
	"30d",
	"90d",
	"365d",
	"all",
]);
export type AdminDashboardPeriod = z.infer<typeof adminDashboardPeriodSchema>;

const CONNECTED_WINDOW_MS = 15 * 60 * 1000;

const PERIOD_MS: Record<Exclude<AdminDashboardPeriod, "all">, number> = {
	"1d": 24 * 60 * 60 * 1000,
	"7d": 7 * 24 * 60 * 60 * 1000,
	"30d": 30 * 24 * 60 * 60 * 1000,
	"90d": 90 * 24 * 60 * 60 * 1000,
	"365d": 365 * 24 * 60 * 60 * 1000,
};

/** `null` = depuis toujours (pas de borne basse). */
export function periodStart(
	period: AdminDashboardPeriod,
	now = new Date(),
): Date | null {
	if (period === "all") return null;
	return new Date(now.getTime() - PERIOD_MS[period]);
}

/**
 * Fenêtre immédiatement précédente, même durée.
 * Ex. période 7j courante → [now−14j, now−7j).
 * `null` si période = all.
 */
export function previousPeriodWindow(
	period: AdminDashboardPeriod,
	now = new Date(),
): { start: Date; end: Date } | null {
	if (period === "all") return null;
	const duration = PERIOD_MS[period];
	return {
		start: new Date(now.getTime() - 2 * duration),
		end: new Date(now.getTime() - duration),
	};
}

export type AdminUserStats = {
	ready: true;
	newCount: number;
	activeCount: number;
	connectedCount: number;
	/** Écart vs période précédente ; `null` si période = all */
	newCountDelta: number | null;
	activeCountDelta: number | null;
};

export type AdminTopTemplate = {
	templateId: string;
	name: string;
	/** Unlocks / achats sur la période */
	unlockCount: number;
	/** CV créés avec ce modèle sur la période */
	cvCount: number;
	/** Téléchargements de ce modèle sur la période */
	downloadCount: number;
	/** Moyenne (unlocks + CV + DL) / 3 */
	popularityScore: number;
};

export type AdminTopColor = {
	name: string;
	/** Shade Tailwind stockée en base Color.primary (ex. "-600") */
	primary: string | null;
	cvCount: number;
	downloadCount: number;
	/** Popularité = (cvCount + downloadCount) / 2 */
	popularityScore: number;
};

/** Ancien top (période précédente) — noms seulement côté UI */
export type AdminPreviousTopTemplate = {
	templateId: string;
	name: string;
};

export type AdminPreviousTopColor = {
	name: string;
	primary: string | null;
};

export type AdminCvStats = {
	ready: true;
	createdCount: number;
	existingCount: number;
	templatesUsed: number;
	/** Écart vs période précédente ; `null` si période = all */
	createdCountDelta: number | null;
	templatesUsedDelta: number | null;
	topTemplates: AdminTopTemplate[];
	topColors: AdminTopColor[];
	/** `null` si période = all */
	previousTopTemplates: AdminPreviousTopTemplate[] | null;
	previousTopColors: AdminPreviousTopColor[] | null;
};

type DateWindow = { start: Date | null; end: Date | null };

function dateInWindow(
	start: Date | null,
	end: Date | null,
): { gte?: Date; lt?: Date } | undefined {
	if (!start && !end) return undefined;
	return {
		...(start ? { gte: start } : {}),
		...(end ? { lt: end } : {}),
	};
}


export type AdminDownloadStats = {
	ready: true;
	/** Totaux sur la période sélectionnée */
	withLogo: number;
	withoutLogo: number;
	total: number;
	/** Totaux depuis toujours (hors filtre période) */
	withLogoAllTime: number;
	withoutLogoAllTime: number;
	/** Écart vs période précédente ; `null` si période = all */
	withLogoDelta: number | null;
	withoutLogoDelta: number | null;
};

export type AdminAiStats = {
	ready: true;
	total: number;
	importCv: number;
	reviewCv: number;
	rewriteSection: number;
	uniqueUsers: number;
	totalAllTime: number;
	/** Écart vs période précédente ; `null` si période = all */
	totalDelta: number | null;
	importCvDelta: number | null;
	reviewCvDelta: number | null;
	rewriteSectionDelta: number | null;
	uniqueUsersDelta: number | null;
};

export type AdminApiErrorStats = {
	ready: true;
	total: number;
	internalServerError: number;
	tooManyRequests: number;
	timeout: number;
	uniqueUsers: number;
	totalAllTime: number;
	/** Écart vs période précédente ; `null` si période = all */
	totalDelta: number | null;
	internalServerErrorDelta: number | null;
	tooManyRequestsDelta: number | null;
	timeoutDelta: number | null;
	uniqueUsersDelta: number | null;
};

export class AdminDashboardService {
	async getUserStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminUserStats> {
		const since = periodStart(period, now);
		const previous = previousPeriodWindow(period, now);
		const connectedSince = new Date(now.getTime() - CONNECTED_WINDOW_MS);

		const [newCount, activeCount, connectedCount, prevNewCount, prevActiveCount] =
			await Promise.all([
				prisma.user.count({
					where: since ? { createdAt: { gte: since } } : {},
				}),
				prisma.user.count({
					where: since
						? { lastLoginAt: { gte: since } }
						: { lastLoginAt: { not: null } },
				}),
				prisma.user.count({
					where: { lastLoginAt: { gte: connectedSince } },
				}),
				previous
					? prisma.user.count({
							where: {
								createdAt: { gte: previous.start, lt: previous.end },
							},
						})
					: Promise.resolve(null),
				previous
					? prisma.user.count({
							where: {
								lastLoginAt: { gte: previous.start, lt: previous.end },
							},
						})
					: Promise.resolve(null),
			]);

		return {
			ready: true,
			newCount,
			activeCount,
			connectedCount,
			newCountDelta:
				prevNewCount === null ? null : newCount - prevNewCount,
			activeCountDelta:
				prevActiveCount === null ? null : activeCount - prevActiveCount,
		};
	}

	async getCvStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminCvStats> {
		const since = periodStart(period, now);
		const previous = previousPeriodWindow(period, now);
		const currentWindow: DateWindow = { start: since, end: null };
		const previousWindow: DateWindow | null = previous
			? { start: previous.start, end: previous.end }
			: null;

		const createdWhere = dateInWindow(currentWindow.start, currentWindow.end);
		const unlockWhere = dateInWindow(currentWindow.start, currentWindow.end);

		const [
			createdCount,
			existingCount,
			templateGroups,
			unlockGroups,
			downloadGroups,
			prevTemplateGroups,
			prevUnlockGroups,
			prevDownloadGroups,
			colorGroups,
			downloadColorGroups,
			prevColorGroups,
			prevDownloadColorGroups,
		] = await Promise.all([
			prisma.cV.count({
				where: createdWhere ? { createdAt: createdWhere } : {},
			}),
			prisma.cV.count(),
			prisma.cV.groupBy({
				by: ["templateId"],
				where: createdWhere ? { createdAt: createdWhere } : {},
				_count: { _all: true },
			}),
			prisma.unlockedTemplate.groupBy({
				by: ["templateId"],
				where: unlockWhere ? { unlockedAt: unlockWhere } : {},
				_count: { _all: true },
			}),
			prisma.downloadEvent.groupBy({
				by: ["templateId"],
				where: {
					...(createdWhere ? { createdAt: createdWhere } : {}),
					templateId: { not: null },
				},
				_count: { _all: true },
			}),
			previousWindow
				? prisma.cV.groupBy({
						by: ["templateId"],
						where: {
							createdAt: dateInWindow(
								previousWindow.start,
								previousWindow.end,
							),
						},
						_count: { _all: true },
					})
				: Promise.resolve([]),
			previousWindow
				? prisma.unlockedTemplate.groupBy({
						by: ["templateId"],
						where: {
							unlockedAt: dateInWindow(
								previousWindow.start,
								previousWindow.end,
							),
						},
						_count: { _all: true },
					})
				: Promise.resolve([]),
			previousWindow
				? prisma.downloadEvent.groupBy({
						by: ["templateId"],
						where: {
							createdAt: dateInWindow(
								previousWindow.start,
								previousWindow.end,
							),
							templateId: { not: null },
						},
						_count: { _all: true },
					})
				: Promise.resolve([]),
			prisma.cV.groupBy({
				by: ["primaryColorName"],
				where: {
					...(createdWhere ? { createdAt: createdWhere } : {}),
					primaryColorName: { not: null },
				},
				_count: { _all: true },
			}),
			prisma.downloadEvent.groupBy({
				by: ["primaryColorName"],
				where: {
					...(createdWhere ? { createdAt: createdWhere } : {}),
					primaryColorName: { not: null },
				},
				_count: { _all: true },
			}),
			previousWindow
				? prisma.cV.groupBy({
						by: ["primaryColorName"],
						where: {
							createdAt: dateInWindow(
								previousWindow.start,
								previousWindow.end,
							),
							primaryColorName: { not: null },
						},
						_count: { _all: true },
					})
				: Promise.resolve([]),
			previousWindow
				? prisma.downloadEvent.groupBy({
						by: ["primaryColorName"],
						where: {
							createdAt: dateInWindow(
								previousWindow.start,
								previousWindow.end,
							),
							primaryColorName: { not: null },
						},
						_count: { _all: true },
					})
				: Promise.resolve([]),
		]);

		const rankTemplates = (
			cvGroups: typeof templateGroups,
			uGroups: typeof unlockGroups,
			dGroups: typeof downloadGroups,
		) => {
			const cvById = new Map(
				cvGroups.map((g) => [g.templateId, g._count._all]),
			);
			const unlockById = new Map(
				uGroups.map((g) => [g.templateId, g._count._all]),
			);
			const downloadsById = new Map(
				dGroups
					.filter((g) => g.templateId != null)
					.map((g) => [g.templateId as string, g._count._all]),
			);
			const allTemplateIds = new Set([
				...cvById.keys(),
				...unlockById.keys(),
				...downloadsById.keys(),
			]);
			const ranked = [...allTemplateIds].map((templateId) => {
				const unlockCount = unlockById.get(templateId) ?? 0;
				const cvCount = cvById.get(templateId) ?? 0;
				const downloadCount = downloadsById.get(templateId) ?? 0;
				return {
					templateId,
					unlockCount,
					cvCount,
					downloadCount,
					popularityScore: (unlockCount + cvCount + downloadCount) / 3,
				};
			});
			ranked.sort((a, b) => {
				const diff = b.popularityScore - a.popularityScore;
				if (diff !== 0) return diff;
				return b.cvCount - a.cvCount;
			});
			return ranked.slice(0, 5);
		};

		const rankColors = (
			cvColorGroups: typeof colorGroups,
			dlColorGroups: typeof downloadColorGroups,
		) => {
			const cvByColor = new Map(
				cvColorGroups
					.filter((g) => g.primaryColorName != null)
					.map((g) => [g.primaryColorName as string, g._count._all]),
			);
			const dlByColor = new Map(
				dlColorGroups
					.filter((g) => g.primaryColorName != null)
					.map((g) => [g.primaryColorName as string, g._count._all]),
			);
			return [...new Set([...cvByColor.keys(), ...dlByColor.keys()])]
				.map((name) => {
					const cvCount = cvByColor.get(name) ?? 0;
					const downloadCount = dlByColor.get(name) ?? 0;
					return {
						name,
						cvCount,
						downloadCount,
						popularityScore: (cvCount + downloadCount) / 2,
					};
				})
				.sort((a, b) => {
					const diff = b.popularityScore - a.popularityScore;
					if (diff !== 0) return diff;
					return a.name.localeCompare(b.name, "fr");
				})
				.slice(0, 5);
		};

		const topGroups = rankTemplates(
			templateGroups,
			unlockGroups,
			downloadGroups,
		);
		const prevTopGroups = previousWindow
			? rankTemplates(
					prevTemplateGroups,
					prevUnlockGroups,
					prevDownloadGroups,
				)
			: null;
		const topColorGroups = rankColors(colorGroups, downloadColorGroups);
		const prevTopColorGroups = previousWindow
			? rankColors(prevColorGroups, prevDownloadColorGroups)
			: null;

		const allTemplateIdsForNames = [
			...topGroups.map((g) => g.templateId),
			...(prevTopGroups?.map((g) => g.templateId) ?? []),
		];
		const uniqueTemplateIds = [...new Set(allTemplateIdsForNames)];
		const templates =
			uniqueTemplateIds.length === 0
				? ([] as Array<{ id: string; name: string }>)
				: await prisma.cVTemplate.findMany({
						where: { id: { in: uniqueTemplateIds } },
						select: { id: true, name: true },
					});
		const nameById = new Map(templates.map((t) => [t.id, t.name]));

		const topTemplates: AdminTopTemplate[] = topGroups.map((g) => ({
			templateId: g.templateId,
			name: nameById.get(g.templateId) ?? g.templateId,
			unlockCount: g.unlockCount,
			cvCount: g.cvCount,
			downloadCount: g.downloadCount,
			popularityScore: g.popularityScore,
		}));
		const previousTopTemplates: AdminPreviousTopTemplate[] | null =
			prevTopGroups
				? prevTopGroups.map((g) => ({
						templateId: g.templateId,
						name: nameById.get(g.templateId) ?? g.templateId,
					}))
				: null;

		const allColorNames = [
			...topColorGroups.map((g) => g.name),
			...(prevTopColorGroups?.map((g) => g.name) ?? []),
		];
		const uniqueColorNames = [...new Set(allColorNames)];
		const colorRows =
			uniqueColorNames.length === 0
				? []
				: await prisma.color.findMany({
						where: { name: { in: uniqueColorNames } },
						select: { name: true, primary: true },
					});
		const shadeByName = new Map(
			colorRows.map((c) => [c.name, c.primary]),
		);

		const topColors: AdminTopColor[] = topColorGroups.map((g) => ({
			name: g.name,
			primary: shadeByName.get(g.name) ?? null,
			cvCount: g.cvCount,
			downloadCount: g.downloadCount,
			popularityScore: g.popularityScore,
		}));
		const previousTopColors: AdminPreviousTopColor[] | null =
			prevTopColorGroups
				? prevTopColorGroups.map((g) => ({
						name: g.name,
						primary: shadeByName.get(g.name) ?? null,
					}))
				: null;

		const templatesUsed = templateGroups.length;
		const prevCreatedCount = previousWindow
			? prevTemplateGroups.reduce((sum, g) => sum + g._count._all, 0)
			: null;
		const prevTemplatesUsed = previousWindow
			? prevTemplateGroups.length
			: null;

		return {
			ready: true,
			createdCount,
			existingCount,
			templatesUsed,
			createdCountDelta:
				prevCreatedCount === null
					? null
					: createdCount - prevCreatedCount,
			templatesUsedDelta:
				prevTemplatesUsed === null
					? null
					: templatesUsed - prevTemplatesUsed,
			topTemplates,
			topColors,
			previousTopTemplates,
			previousTopColors,
		};
	}

	async getDownloadStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminDownloadStats> {
		const since = periodStart(period, now);
		const previous = previousPeriodWindow(period, now);
		const whereBase = since ? { createdAt: { gte: since } } : {};

		const [
			withLogo,
			withoutLogo,
			withLogoAllTime,
			withoutLogoAllTime,
			prevWithLogo,
			prevWithoutLogo,
		] = await Promise.all([
			prisma.downloadEvent.count({
				where: { ...whereBase, variant: "WITH_LOGO" },
			}),
			prisma.downloadEvent.count({
				where: { ...whereBase, variant: "WITHOUT_LOGO" },
			}),
			prisma.downloadEvent.count({
				where: { variant: "WITH_LOGO" },
			}),
			prisma.downloadEvent.count({
				where: { variant: "WITHOUT_LOGO" },
			}),
			previous
				? prisma.downloadEvent.count({
						where: {
							variant: "WITH_LOGO",
							createdAt: { gte: previous.start, lt: previous.end },
						},
					})
				: Promise.resolve(null),
			previous
				? prisma.downloadEvent.count({
						where: {
							variant: "WITHOUT_LOGO",
							createdAt: { gte: previous.start, lt: previous.end },
						},
					})
				: Promise.resolve(null),
		]);

		return {
			ready: true,
			withLogo,
			withoutLogo,
			total: withLogo + withoutLogo,
			withLogoAllTime,
			withoutLogoAllTime,
			withLogoDelta:
				prevWithLogo === null ? null : withLogo - prevWithLogo,
			withoutLogoDelta:
				prevWithoutLogo === null ? null : withoutLogo - prevWithoutLogo,
		};
	}

	async getAiStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminAiStats> {
		const since = periodStart(period, now);
		const previous = previousPeriodWindow(period, now);
		const whereBase = since ? { createdAt: { gte: since } } : {};
		const prevWhere = previous
			? { createdAt: { gte: previous.start, lt: previous.end } }
			: null;

		const [
			importCv,
			reviewCv,
			rewriteSection,
			totalAllTime,
			uniqueGroups,
			prevImportCv,
			prevReviewCv,
			prevRewriteSection,
			prevUniqueGroups,
		] = await Promise.all([
			prisma.aiEvent.count({
				where: { ...whereBase, feature: "IMPORT_CV" },
			}),
			prisma.aiEvent.count({
				where: { ...whereBase, feature: "REVIEW_CV" },
			}),
			prisma.aiEvent.count({
				where: { ...whereBase, feature: "REWRITE_SECTION" },
			}),
			prisma.aiEvent.count(),
			prisma.aiEvent.groupBy({
				by: ["userId"],
				where: {
					...whereBase,
					userId: { not: null },
				},
			}),
			prevWhere
				? prisma.aiEvent.count({
						where: { ...prevWhere, feature: "IMPORT_CV" },
					})
				: Promise.resolve(null),
			prevWhere
				? prisma.aiEvent.count({
						where: { ...prevWhere, feature: "REVIEW_CV" },
					})
				: Promise.resolve(null),
			prevWhere
				? prisma.aiEvent.count({
						where: { ...prevWhere, feature: "REWRITE_SECTION" },
					})
				: Promise.resolve(null),
			prevWhere
				? prisma.aiEvent.groupBy({
						by: ["userId"],
						where: {
							...prevWhere,
							userId: { not: null },
						},
					})
				: Promise.resolve(null),
		]);

		const total = importCv + reviewCv + rewriteSection;
		const uniqueUsers = uniqueGroups.length;
		const prevTotal =
			prevImportCv === null ||
			prevReviewCv === null ||
			prevRewriteSection === null
				? null
				: prevImportCv + prevReviewCv + prevRewriteSection;
		const prevUniqueUsers =
			prevUniqueGroups === null ? null : prevUniqueGroups.length;

		return {
			ready: true,
			total,
			importCv,
			reviewCv,
			rewriteSection,
			uniqueUsers,
			totalAllTime,
			totalDelta: prevTotal === null ? null : total - prevTotal,
			importCvDelta:
				prevImportCv === null ? null : importCv - prevImportCv,
			reviewCvDelta:
				prevReviewCv === null ? null : reviewCv - prevReviewCv,
			rewriteSectionDelta:
				prevRewriteSection === null
					? null
					: rewriteSection - prevRewriteSection,
			uniqueUsersDelta:
				prevUniqueUsers === null
					? null
					: uniqueUsers - prevUniqueUsers,
		};
	}

	async getApiErrorStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminApiErrorStats> {
		const since = periodStart(period, now);
		const previous = previousPeriodWindow(period, now);
		const whereBase = since ? { createdAt: { gte: since } } : {};
		const prevWhere = previous
			? { createdAt: { gte: previous.start, lt: previous.end } }
			: null;

		const [
			total,
			internalServerError,
			tooManyRequests,
			timeout,
			totalAllTime,
			uniqueGroups,
			prevTotal,
			prevInternalServerError,
			prevTooManyRequests,
			prevTimeout,
			prevUniqueGroups,
		] = await Promise.all([
			prisma.apiErrorEvent.count({ where: whereBase }),
			prisma.apiErrorEvent.count({
				where: { ...whereBase, code: "INTERNAL_SERVER_ERROR" },
			}),
			prisma.apiErrorEvent.count({
				where: { ...whereBase, code: "TOO_MANY_REQUESTS" },
			}),
			prisma.apiErrorEvent.count({
				where: { ...whereBase, code: "TIMEOUT" },
			}),
			prisma.apiErrorEvent.count(),
			prisma.apiErrorEvent.groupBy({
				by: ["userId"],
				where: {
					...whereBase,
					userId: { not: null },
				},
			}),
			prevWhere
				? prisma.apiErrorEvent.count({ where: prevWhere })
				: Promise.resolve(null),
			prevWhere
				? prisma.apiErrorEvent.count({
						where: {
							...prevWhere,
							code: "INTERNAL_SERVER_ERROR",
						},
					})
				: Promise.resolve(null),
			prevWhere
				? prisma.apiErrorEvent.count({
						where: {
							...prevWhere,
							code: "TOO_MANY_REQUESTS",
						},
					})
				: Promise.resolve(null),
			prevWhere
				? prisma.apiErrorEvent.count({
						where: { ...prevWhere, code: "TIMEOUT" },
					})
				: Promise.resolve(null),
			prevWhere
				? prisma.apiErrorEvent.groupBy({
						by: ["userId"],
						where: {
							...prevWhere,
							userId: { not: null },
						},
					})
				: Promise.resolve(null),
		]);

		const uniqueUsers = uniqueGroups.length;
		const prevUniqueUsers =
			prevUniqueGroups === null ? null : prevUniqueGroups.length;

		return {
			ready: true,
			total,
			internalServerError,
			tooManyRequests,
			timeout,
			uniqueUsers,
			totalAllTime,
			totalDelta: prevTotal === null ? null : total - prevTotal,
			internalServerErrorDelta:
				prevInternalServerError === null
					? null
					: internalServerError - prevInternalServerError,
			tooManyRequestsDelta:
				prevTooManyRequests === null
					? null
					: tooManyRequests - prevTooManyRequests,
			timeoutDelta:
				prevTimeout === null ? null : timeout - prevTimeout,
			uniqueUsersDelta:
				prevUniqueUsers === null
					? null
					: uniqueUsers - prevUniqueUsers,
		};
	}
}

export const adminDashboardService = new AdminDashboardService();
