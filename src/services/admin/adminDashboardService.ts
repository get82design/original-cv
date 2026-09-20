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
	count: number;
};

export type AdminCvStats = {
	ready: true;
	createdCount: number;
	existingCount: number;
	templatesUsed: number;
	topTemplates: AdminTopTemplate[];
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

		const [createdCount, existingCount, templateGroups] = await Promise.all([
			prisma.cV.count({ where: createdWhere }),
			prisma.cV.count(),
			prisma.cV.groupBy({
				by: ["templateId"],
				where: createdWhere,
				_count: { _all: true },
				orderBy: { _count: { templateId: "desc" } },
			}),
		]);

		const topGroups = templateGroups.slice(0, 3);
		const topIds = topGroups.map((g) => g.templateId);
		const templates =
			topIds.length === 0
				? []
				: await prisma.cVTemplate.findMany({
						where: { id: { in: topIds } },
						select: { id: true, name: true },
					});
		const nameById = new Map(templates.map((t) => [t.id, t.name]));

		const topTemplates: AdminTopTemplate[] = topGroups.map((g) => ({
			templateId: g.templateId,
			name: nameById.get(g.templateId) ?? g.templateId,
			count: g._count._all,
		}));

		return {
			ready: true,
			createdCount,
			existingCount,
			templatesUsed: templateGroups.length,
			topTemplates,
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
}

export const adminDashboardService = new AdminDashboardService();
