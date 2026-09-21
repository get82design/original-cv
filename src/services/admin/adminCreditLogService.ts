import type { Prisma } from "../../../generated/prisma/client";
import type {
	AdminCreditKind,
	AdminCreditReason,
} from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import {
	periodStart,
	type AdminDashboardPeriod,
} from "./adminDashboardService";

export type AdminCreditLogListItem = {
	id: string;
	createdAt: Date;
	kind: AdminCreditKind;
	reason: AdminCreditReason;
	delta: number;
	before: number;
	after: number;
	targetUserId: string;
	targetUserEmail: string | null;
	actorUserId: string | null;
	actorUserEmail: string | null;
};

export type AdminCreditLogListResult = {
	items: AdminCreditLogListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export class AdminCreditLogService {
	async listCreditLogs(input: {
		period?: AdminDashboardPeriod | undefined;
		kind?: AdminCreditKind | undefined;
		search?: string | undefined;
		page?: number | undefined;
		pageSize?: number | undefined;
	}): Promise<AdminCreditLogListResult> {
		const page = Math.max(1, input.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
		const search = input.search?.trim();
		const since = periodStart(input.period ?? "7d");

		const where: Prisma.AdminCreditLogWhereInput = {
			...(since ? { createdAt: { gte: since } } : {}),
			...(input.kind ? { kind: input.kind } : {}),
			...(search
				? {
						OR: [
							{
								targetUser: {
									email: {
										contains: search,
										mode: "insensitive",
									},
								},
							},
							{
								actorUser: {
									email: {
										contains: search,
										mode: "insensitive",
									},
								},
							},
						],
					}
				: {}),
		};

		const [total, rows] = await Promise.all([
			prisma.adminCreditLog.count({ where }),
			prisma.adminCreditLog.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					createdAt: true,
					kind: true,
					reason: true,
					delta: true,
					before: true,
					after: true,
					targetUserId: true,
					actorUserId: true,
					targetUser: { select: { email: true } },
					actorUser: { select: { email: true } },
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
				kind: r.kind,
				reason: r.reason,
				delta: r.delta,
				before: r.before,
				after: r.after,
				targetUserId: r.targetUserId,
				targetUserEmail: r.targetUser.email,
				actorUserId: r.actorUserId,
				actorUserEmail: r.actorUser?.email ?? null,
			})),
		};
	}
}

export const adminCreditLogService = new AdminCreditLogService();
