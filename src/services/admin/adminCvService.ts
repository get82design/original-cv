import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { periodStart, type AdminDashboardPeriod } from "./adminDashboardService";

export type AdminCvListItem = {
	id: string;
	createdAt: Date;
	title: string;
	userId: string;
	userEmail: string | null;
	templateId: string;
	templateName: string;
	primaryColorName: string | null;
	/** Shade CSS ex. "-600" (depuis Color.primary) */
	colorPrimary: string | null;
};

export type AdminCvListResult = {
	items: AdminCvListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export type AdminCvFeedFilters = {
	templates: { id: string; name: string }[];
	colors: { name: string; primary: string }[];
};

export type AdminTopTemplateSort =
	| "popularityScore"
	| "unlockCount"
	| "cvCount"
	| "downloadCount"
	| "freeDownloadCount"
	| "paidDownloadCount";

export type AdminTopTemplateRankItem = {
	templateId: string;
	name: string;
	/** Achats / unlocks sur la période */
	unlockCount: number;
	cvCount: number;
	downloadCount: number;
	freeDownloadCount: number;
	paidDownloadCount: number;
	/**
	 * Popularité = moyenne (unlocks + CV créés + DL) / 3
	 */
	popularityScore: number;
};

export type AdminTopColorRankItem = {
	name: string;
	primary: string | null;
	cvCount: number;
	downloadCount: number;
	/** Popularité = (cvCount + downloadCount) / 2 */
	popularityScore: number;
};

export class AdminCvService {
	async listFilters(): Promise<AdminCvFeedFilters> {
		const [templates, colors] = await Promise.all([
			prisma.cVTemplate.findMany({
				select: { id: true, name: true },
				orderBy: { name: "asc" },
			}),
			prisma.color.findMany({
				select: { name: true, primary: true },
				orderBy: { order: "asc" },
			}),
		]);
		return { templates, colors };
	}

	async listCvs(input: {
		period?: AdminDashboardPeriod | undefined;
		templateId?: string | undefined;
		primaryColorName?: string | undefined;
		search?: string | undefined;
		page?: number | undefined;
		pageSize?: number | undefined;
	}): Promise<AdminCvListResult> {
		const page = Math.max(1, input.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
		const search = input.search?.trim();
		const since = periodStart(input.period ?? "7d");

		const where: Prisma.CVWhereInput = {
			...(since ? { createdAt: { gte: since } } : {}),
			...(input.templateId ? { templateId: input.templateId } : {}),
			...(input.primaryColorName ? { primaryColorName: input.primaryColorName } : {}),
			...(search
				? {
						user: {
							email: {
								contains: search,
								mode: "insensitive",
							},
						},
					}
				: {}),
		};

		const [total, rows] = await Promise.all([
			prisma.cV.count({ where }),
			prisma.cV.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					createdAt: true,
					title: true,
					userId: true,
					templateId: true,
					primaryColorName: true,
					user: { select: { email: true } },
					template: { select: { name: true } },
				},
			}),
		]);

		const colorNames = [
			...new Set(rows.map((r) => r.primaryColorName).filter((n): n is string => n != null)),
		];
		const colorRows =
			colorNames.length === 0
				? []
				: await prisma.color.findMany({
						where: { name: { in: colorNames } },
						select: { name: true, primary: true },
					});
		const shadeByName = new Map(colorRows.map((c) => [c.name, c.primary] as const));

		return {
			total,
			page,
			pageSize,
			items: rows.map((r) => ({
				id: r.id,
				createdAt: r.createdAt,
				title: r.title,
				userId: r.userId,
				userEmail: r.user?.email ?? null,
				templateId: r.templateId,
				templateName: r.template.name,
				primaryColorName: r.primaryColorName,
				colorPrimary: r.primaryColorName ? (shadeByName.get(r.primaryColorName) ?? null) : null,
			})),
		};
	}

	/**
	 * Classement complet de tous les templates (catalogue),
	 * unlocks + CV créés + DL free/paid sur la période.
	 * Popularité = moyenne (unlockCount + cvCount + downloadCount) / 3.
	 */
	async listTopTemplates(input: {
		period?: AdminDashboardPeriod | undefined;
		sortBy?: AdminTopTemplateSort | undefined;
	}): Promise<AdminTopTemplateRankItem[]> {
		const since = periodStart(input.period ?? "7d");
		const sortBy: AdminTopTemplateSort = input.sortBy ?? "popularityScore";
		const createdWhere = since ? { createdAt: { gte: since } } : {};
		const unlockWhere = since ? { unlockedAt: { gte: since } } : {};

		const [templates, cvGroups, dlGroups, unlockGroups] = await Promise.all([
			prisma.cVTemplate.findMany({
				select: { id: true, name: true },
			}),
			prisma.cV.groupBy({
				by: ["templateId"],
				where: createdWhere,
				_count: { _all: true },
			}),
			prisma.downloadEvent.groupBy({
				by: ["templateId", "variant"],
				where: {
					...(since ? { createdAt: { gte: since } } : {}),
					templateId: { not: null },
				},
				_count: { _all: true },
			}),
			prisma.unlockedTemplate.groupBy({
				by: ["templateId"],
				where: unlockWhere,
				_count: { _all: true },
			}),
		]);

		const cvById = new Map(cvGroups.map((g) => [g.templateId, g._count._all]));
		const unlockById = new Map(unlockGroups.map((g) => [g.templateId, g._count._all]));
		const freeById = new Map<string, number>();
		const paidById = new Map<string, number>();
		for (const g of dlGroups) {
			if (!g.templateId) continue;
			if (g.variant === "WITH_LOGO") {
				freeById.set(g.templateId, g._count._all);
			} else {
				paidById.set(g.templateId, g._count._all);
			}
		}

		const items: AdminTopTemplateRankItem[] = templates.map((t) => {
			const freeDownloadCount = freeById.get(t.id) ?? 0;
			const paidDownloadCount = paidById.get(t.id) ?? 0;
			const downloadCount = freeDownloadCount + paidDownloadCount;
			const cvCount = cvById.get(t.id) ?? 0;
			const unlockCount = unlockById.get(t.id) ?? 0;
			return {
				templateId: t.id,
				name: t.name,
				unlockCount,
				cvCount,
				freeDownloadCount,
				paidDownloadCount,
				downloadCount,
				popularityScore: (unlockCount + cvCount + downloadCount) / 3,
			};
		});

		items.sort((a, b) => {
			const diff = b[sortBy] - a[sortBy];
			if (diff !== 0) return diff;
			return a.name.localeCompare(b.name, "fr");
		});

		return items;
	}

	/**
	 * Classement complet des couleurs (catalogue + noms orphelins utilisés).
	 * Popularité = (CV créés avec cette couleur + DL snapshot) / 2.
	 */
	async listTopColors(input: {
		period?: AdminDashboardPeriod | undefined;
	}): Promise<AdminTopColorRankItem[]> {
		const since = periodStart(input.period ?? "7d");
		const createdWhere = since ? { createdAt: { gte: since } } : {};

		const [colors, colorGroups, downloadColorGroups] = await Promise.all([
			prisma.color.findMany({
				select: { name: true, primary: true, order: true },
				orderBy: { order: "asc" },
			}),
			prisma.cV.groupBy({
				by: ["primaryColorName"],
				where: {
					...createdWhere,
					primaryColorName: { not: null },
				},
				_count: { _all: true },
			}),
			prisma.downloadEvent.groupBy({
				by: ["primaryColorName"],
				where: {
					...createdWhere,
					primaryColorName: { not: null },
				},
				_count: { _all: true },
			}),
		]);

		const cvByName = new Map(
			colorGroups
				.filter((g) => g.primaryColorName != null)
				.map((g) => [g.primaryColorName as string, g._count._all]),
		);
		const dlByName = new Map(
			downloadColorGroups
				.filter((g) => g.primaryColorName != null)
				.map((g) => [g.primaryColorName as string, g._count._all]),
		);
		const shadeByName = new Map(colors.map((c) => [c.name, c.primary] as const));

		const names = new Set<string>([
			...colors.map((c) => c.name),
			...cvByName.keys(),
			...dlByName.keys(),
		]);

		const items: AdminTopColorRankItem[] = [...names].map((name) => {
			const cvCount = cvByName.get(name) ?? 0;
			const downloadCount = dlByName.get(name) ?? 0;
			return {
				name,
				primary: shadeByName.get(name) ?? null,
				cvCount,
				downloadCount,
				popularityScore: (cvCount + downloadCount) / 2,
			};
		});

		items.sort((a, b) => {
			const diff = b.popularityScore - a.popularityScore;
			if (diff !== 0) return diff;
			return a.name.localeCompare(b.name, "fr");
		});

		return items;
	}
}

export const adminCvService = new AdminCvService();
