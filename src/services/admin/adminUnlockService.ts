import type { Prisma } from "../../../generated/prisma/client";
import type { UnlockMethod } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { unlockedTemplateService } from "../commons/unlockedTemplateService";
import { periodStart, type AdminDashboardPeriod } from "./adminDashboardService";

export type AdminUnlockListItem = {
	id: string;
	unlockedAt: Date;
	method: UnlockMethod;
	userId: string;
	userEmail: string | null;
	templateId: string;
	templateName: string;
};

export type AdminUnlockListResult = {
	items: AdminUnlockListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export class AdminUnlockService {
	/**
	 * Offre un template à un user (cadeau admin) + unlockGifts complets.
	 */
	async unlockForUser(userId: string, templateId: string) {
		return unlockedTemplateService.unlockTemplate(userId, templateId, {
			method: "gift",
		});
	}

	async listUnlocks(input: {
		period?: AdminDashboardPeriod | undefined;
		method?: UnlockMethod | undefined;
		templateId?: string | undefined;
		search?: string | undefined;
		page?: number | undefined;
		pageSize?: number | undefined;
	}): Promise<AdminUnlockListResult> {
		const page = Math.max(1, input.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
		const search = input.search?.trim();
		const since = periodStart(input.period ?? "7d");

		const where: Prisma.UnlockedTemplateWhereInput = {
			...(since ? { unlockedAt: { gte: since } } : {}),
			...(input.method ? { method: input.method } : {}),
			...(input.templateId ? { templateId: input.templateId } : {}),
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
			prisma.unlockedTemplate.count({ where }),
			prisma.unlockedTemplate.findMany({
				where,
				orderBy: { unlockedAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					unlockedAt: true,
					method: true,
					userId: true,
					templateId: true,
					user: { select: { email: true } },
					template: { select: { name: true } },
				},
			}),
		]);

		return {
			total,
			page,
			pageSize,
			items: rows.map((r) => ({
				id: r.id,
				unlockedAt: r.unlockedAt,
				method: r.method,
				userId: r.userId,
				userEmail: r.user.email,
				templateId: r.templateId,
				templateName: r.template.name,
			})),
		};
	}
}

export const adminUnlockService = new AdminUnlockService();
