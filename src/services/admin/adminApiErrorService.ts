import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { periodStart, type AdminDashboardPeriod } from "./adminDashboardService";

const MESSAGE_MAX = 2_000;

export type AdminApiErrorListItem = {
	id: string;
	createdAt: Date;
	path: string;
	code: string;
	message: string;
	userId: string | null;
	userEmail: string | null;
};

export type AdminApiErrorListResult = {
	items: AdminApiErrorListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export class AdminApiErrorService {
	async create(input: {
		path: string;
		code: string;
		message: string;
		userId?: string | null | undefined;
	}): Promise<{ id: string }> {
		const path = input.path.trim().slice(0, 200);
		const code = input.code.trim().slice(0, 80);
		const message = input.message.trim().slice(0, MESSAGE_MAX);

		const row = await prisma.apiErrorEvent.create({
			data: {
				path: path || "unknown",
				code: code || "UNKNOWN",
				message: message || "(empty)",
				userId: input.userId ?? null,
			},
			select: { id: true },
		});

		return row;
	}

	async listApiErrors(input: {
		period?: AdminDashboardPeriod | undefined;
		code?: string | undefined;
		path?: string | undefined;
		search?: string | undefined;
		page?: number | undefined;
		pageSize?: number | undefined;
	}): Promise<AdminApiErrorListResult> {
		const page = Math.max(1, input.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
		const search = input.search?.trim();
		const code = input.code?.trim();
		const pathFilter = input.path?.trim();
		const since = periodStart(input.period ?? "7d");

		const where: Prisma.ApiErrorEventWhereInput = {
			...(since ? { createdAt: { gte: since } } : {}),
			...(code ? { code } : {}),
			...(pathFilter
				? {
						path: {
							contains: pathFilter,
							mode: "insensitive",
						},
					}
				: {}),
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
			prisma.apiErrorEvent.count({ where }),
			prisma.apiErrorEvent.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					createdAt: true,
					path: true,
					code: true,
					message: true,
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
				path: r.path,
				code: r.code,
				message: r.message,
				userId: r.userId,
				userEmail: r.user?.email ?? null,
			})),
		};
	}
}

export const adminApiErrorService = new AdminApiErrorService();
