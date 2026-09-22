import type { Prisma } from "../../../generated/prisma/client";
import type { AiFeature } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { periodStart, type AdminDashboardPeriod } from "./adminDashboardService";

export type AdminAiListItem = {
	id: string;
	createdAt: Date;
	feature: AiFeature;
	detail: string | null;
	userId: string | null;
	userEmail: string | null;
};

export type AdminAiListResult = {
	items: AdminAiListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export class AdminAiService {
	async listAiEvents(input: {
		period?: AdminDashboardPeriod | undefined;
		feature?: AiFeature | undefined;
		search?: string | undefined;
		page?: number | undefined;
		pageSize?: number | undefined;
	}): Promise<AdminAiListResult> {
		const page = Math.max(1, input.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
		const search = input.search?.trim();
		const since = periodStart(input.period ?? "7d");

		const where: Prisma.AiEventWhereInput = {
			...(since ? { createdAt: { gte: since } } : {}),
			...(input.feature ? { feature: input.feature } : {}),
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
			prisma.aiEvent.count({ where }),
			prisma.aiEvent.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					createdAt: true,
					feature: true,
					detail: true,
					userId: true,
					user: { select: { email: true } },
				},
			}),
		]);

		return {
			total,
			page,
			pageSize,
			items: rows.map((r) => ({
				id: r.id,
				createdAt: r.createdAt,
				feature: r.feature,
				detail: r.detail,
				userId: r.userId,
				userEmail: r.user?.email ?? null,
			})),
		};
	}
}

export const adminAiService = new AdminAiService();
