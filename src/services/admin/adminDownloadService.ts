import type { Prisma } from "../../../generated/prisma/client";
import type { DownloadVariant } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { periodStart, type AdminDashboardPeriod } from "./adminDashboardService";

export type AdminDownloadListItem = {
	id: string;
	createdAt: Date;
	variant: DownloadVariant;
	hadAccount: boolean;
	userId: string | null;
	userEmail: string | null;
	cvId: string | null;
	cvTitle: string | null;
	templateId: string | null;
	templateName: string | null;
};

export type AdminDownloadListResult = {
	items: AdminDownloadListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export class AdminDownloadService {
	async listDownloads(input: {
		period?: AdminDashboardPeriod | undefined;
		variant?: DownloadVariant | undefined;
		search?: string | undefined;
		page?: number | undefined;
		pageSize?: number | undefined;
	}): Promise<AdminDownloadListResult> {
		const page = Math.max(1, input.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
		const search = input.search?.trim();
		const since = periodStart(input.period ?? "7d");

		const where: Prisma.DownloadEventWhereInput = {
			...(since ? { createdAt: { gte: since } } : {}),
			...(input.variant ? { variant: input.variant } : {}),
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
			prisma.downloadEvent.count({ where }),
			prisma.downloadEvent.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					createdAt: true,
					variant: true,
					hadAccount: true,
					userId: true,
					cvId: true,
					templateId: true,
					user: { select: { email: true } },
					cv: { select: { title: true } },
				},
			}),
		]);

		const templateIds = [
			...new Set(rows.map((r) => r.templateId).filter((id): id is string => id != null)),
		];
		const templates =
			templateIds.length === 0
				? []
				: await prisma.cVTemplate.findMany({
						where: { id: { in: templateIds } },
						select: { id: true, name: true },
					});
		const nameById = new Map(templates.map((t) => [t.id, t.name]));

		return {
			total,
			page,
			pageSize,
			items: rows.map((r) => ({
				id: r.id,
				createdAt: r.createdAt,
				variant: r.variant,
				hadAccount: r.hadAccount,
				userId: r.userId,
				userEmail: r.user?.email ?? null,
				cvId: r.cvId,
				cvTitle: r.cv?.title ?? null,
				templateId: r.templateId,
				templateName: r.templateId ? (nameById.get(r.templateId) ?? r.templateId) : null,
			})),
		};
	}
}

export const adminDownloadService = new AdminDownloadService();
