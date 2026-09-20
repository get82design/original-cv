import type { PlanRole, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";

export type AdminUserListItem = {
	id: string;
	email: string;
	name: string | null;
	plan: PlanRole;
	role: "USER" | "ADMIN";
	isActive: boolean;
	downloadCredits: number;
	freeDownloadsRemaining: number;
	cvCount: number;
	downloadCount: number;
	lastLoginAt: Date | null;
	createdAt: Date;
};

export type AdminUserListResult = {
	items: AdminUserListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export class AdminUserService {
	async listUsers(input: {
		search?: string;
		isActive?: boolean;
		plan?: PlanRole;
		page?: number;
		pageSize?: number;
	}): Promise<AdminUserListResult> {
		const page = Math.max(1, input.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
		const search = input.search?.trim();

		const where: Prisma.UserWhereInput = {
			...(typeof input.isActive === "boolean"
				? { isActive: input.isActive }
				: {}),
			...(input.plan ? { plan: input.plan } : {}),
			...(search
				? {
						OR: [
							{
								email: {
									contains: search,
									mode: "insensitive",
								},
							},
							{
								name: {
									contains: search,
									mode: "insensitive",
								},
							},
						],
					}
				: {}),
		};

		const [total, rows] = await Promise.all([
			prisma.user.count({ where }),
			prisma.user.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					email: true,
					name: true,
					plan: true,
					role: true,
					isActive: true,
					downloadCredits: true,
					freeDownloadsRemaining: true,
					lastLoginAt: true,
					createdAt: true,
					_count: { select: { cvs: true, downloadEvents: true } },
				},
			}),
		]);

		return {
			total,
			page,
			pageSize,
			items: rows.map((u) => ({
				id: u.id,
				email: u.email,
				name: u.name,
				plan: u.plan,
				role: u.role,
				isActive: u.isActive,
				downloadCredits: u.downloadCredits,
				freeDownloadsRemaining: u.freeDownloadsRemaining,
				cvCount: u._count.cvs,
				downloadCount: u._count.downloadEvents,
				lastLoginAt: u.lastLoginAt,
				createdAt: u.createdAt,
			})),
		};
	}
}

export const adminUserService = new AdminUserService();
