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

export type AdminUserStats = {
	ready: true;
	newCount: number;
	activeCount: number;
	connectedCount: number;
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
};

export type AdminCvStats = {
	ready: true;
	createdCount: number;
	existingCount: number;
	templatesUsed: number;
	topTemplates: AdminTopTemplate[];
	topColors: AdminTopColor[];
};

export type AdminDownloadStats = {
	ready: true;
	/** Totaux sur la période sélectionnée */
	withLogo: number;
	withoutLogo: number;
	total: number;
	/** Totaux depuis toujours (hors filtre période) */
	withLogoAllTime: number;
	withoutLogoAllTime: number;
};

export type AdminAiStats = {
	ready: true;
	total: number;
	importCv: number;
	reviewCv: number;
	rewriteSection: number;
	uniqueUsers: number;
	totalAllTime: number;
};

export class AdminDashboardService {
	async getUserStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminUserStats> {
		const since = periodStart(period, now);
		const connectedSince = new Date(now.getTime() - CONNECTED_WINDOW_MS);

		const [newCount, activeCount, connectedCount] = await Promise.all([
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
		]);

		return {
			ready: true,
			newCount,
			activeCount,
			connectedCount,
		};
	}

	async getCvStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminCvStats> {
		const since = periodStart(period, now);
		const createdWhere = since ? { createdAt: { gte: since } } : {};
		const unlockWhere = since ? { unlockedAt: { gte: since } } : {};

		const [createdCount, existingCount, templateGroups, unlockGroups, downloadGroups] =
			await Promise.all([
				prisma.cV.count({ where: createdWhere }),
				prisma.cV.count(),
				prisma.cV.groupBy({
					by: ["templateId"],
					where: createdWhere,
					_count: { _all: true },
				}),
				prisma.unlockedTemplate.groupBy({
					by: ["templateId"],
					where: unlockWhere,
					_count: { _all: true },
				}),
				prisma.downloadEvent.groupBy({
					by: ["templateId"],
					where: {
						...(since ? { createdAt: { gte: since } } : {}),
						templateId: { not: null },
					},
					_count: { _all: true },
				}),
			]);

		const cvById = new Map(
			templateGroups.map((g) => [g.templateId, g._count._all]),
		);
		const unlockById = new Map(
			unlockGroups.map((g) => [g.templateId, g._count._all]),
		);
		const downloadsById = new Map(
			downloadGroups
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
		const topGroups = ranked.slice(0, 5);
		const topIds = topGroups.map((g) => g.templateId);

		const templates =
			topIds.length === 0
				? ([] as Array<{ id: string; name: string }>)
				: await prisma.cVTemplate.findMany({
						where: { id: { in: topIds } },
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

		const colorGroups = await prisma.cV.groupBy({
			by: ["primaryColorName"],
			where: {
				...createdWhere,
				primaryColorName: { not: null },
			},
			_count: { _all: true },
			orderBy: { _count: { primaryColorName: "desc" } },
		});
		const topColorGroups = colorGroups.slice(0, 5);
		const colorNames = topColorGroups
			.map((g) => g.primaryColorName)
			.filter((n): n is string => n != null);
		const colorRows =
			colorNames.length === 0
				? []
				: await prisma.color.findMany({
						where: { name: { in: colorNames } },
						select: { name: true, primary: true },
					});
		const shadeByName = new Map(
			colorRows.map((c) => [c.name, c.primary]),
		);

		const topColors: AdminTopColor[] = topColorGroups.map((g) => ({
			name: g.primaryColorName as string,
			primary: shadeByName.get(g.primaryColorName as string) ?? null,
			cvCount: g._count._all,
		}));

		return {
			ready: true,
			createdCount,
			existingCount,
			templatesUsed: templateGroups.length,
			topTemplates,
			topColors,
		};
	}

	async getDownloadStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminDownloadStats> {
		const since = periodStart(period, now);
		const whereBase = since ? { createdAt: { gte: since } } : {};

		const [withLogo, withoutLogo, withLogoAllTime, withoutLogoAllTime] =
			await Promise.all([
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
			]);

		return {
			ready: true,
			withLogo,
			withoutLogo,
			total: withLogo + withoutLogo,
			withLogoAllTime,
			withoutLogoAllTime,
		};
	}

	async getAiStats(
		period: AdminDashboardPeriod,
		now = new Date(),
	): Promise<AdminAiStats> {
		const since = periodStart(period, now);
		const whereBase = since ? { createdAt: { gte: since } } : {};

		const [
			importCv,
			reviewCv,
			rewriteSection,
			totalAllTime,
			uniqueGroups,
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
		]);

		const total = importCv + reviewCv + rewriteSection;

		return {
			ready: true,
			total,
			importCv,
			reviewCv,
			rewriteSection,
			uniqueUsers: uniqueGroups.length,
			totalAllTime,
		};
	}
}

export const adminDashboardService = new AdminDashboardService();
