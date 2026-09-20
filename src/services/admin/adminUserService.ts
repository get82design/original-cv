import type { PlanRole, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { NotFoundError, ValidationError } from "../errors";

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
	hasProfile: boolean;
	lastLoginAt: Date | null;
	createdAt: Date;
};

export type AdminUserListResult = {
	items: AdminUserListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export type AdminUserDetail = {
	id: string;
	email: string;
	name: string | null;
	image: string | null;
	plan: PlanRole;
	role: "USER" | "ADMIN";
	isActive: boolean;
	subscriptionEnd: Date | null;
	downloadCredits: number;
	freeDownloadsRemaining: number;
	maxCvs: number;
	iaRequestsUsed: number;
	lastIaReset: Date;
	lastLoginAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	cvCount: number;
	downloadCount: number;
	hasProfile: boolean;
	cvs: Array<{
		id: string;
		title: string;
		templateId: string;
		templateName: string;
		createdAt: Date;
		updatedAt: Date;
	}>;
	recentDownloads: Array<{
		id: string;
		createdAt: Date;
		variant: "WITH_LOGO" | "WITHOUT_LOGO";
		cvId: string | null;
		cvTitle: string | null;
		templateId: string | null;
	}>;
	recentAiEvents: Array<{
		id: string;
		createdAt: Date;
		feature: "IMPORT_CV" | "REVIEW_CV" | "REWRITE_SECTION";
		detail: string | null;
	}>;
	purchaseHistory: Array<{
		id: string;
		createdAt: Date;
		kind: "TEMPLATE" | "FREE_GRANT";
		label: string;
		amount: number | null;
	}>;
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
					profile: { select: { id: true } },
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
				hasProfile: u.profile != null,
				lastLoginAt: u.lastLoginAt,
				createdAt: u.createdAt,
			})),
		};
	}

	async getUserDetail(id: string): Promise<AdminUserDetail> {
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				image: true,
				plan: true,
				role: true,
				isActive: true,
				subscriptionEnd: true,
				downloadCredits: true,
				freeDownloadsRemaining: true,
				maxCvs: true,
				iaRequestsUsed: true,
				lastIaReset: true,
				lastLoginAt: true,
				createdAt: true,
				updatedAt: true,
				_count: { select: { cvs: true, downloadEvents: true } },
				profile: { select: { id: true } },
				cvs: {
					orderBy: { updatedAt: "desc" },
					select: {
						id: true,
						title: true,
						templateId: true,
						createdAt: true,
						updatedAt: true,
						template: { select: { name: true } },
					},
				},
				downloadEvents: {
					orderBy: { createdAt: "desc" },
					take: 20,
					select: {
						id: true,
						createdAt: true,
						variant: true,
						cvId: true,
						templateId: true,
						cv: { select: { title: true } },
					},
				},
				aiEvents: {
					orderBy: { createdAt: "desc" },
					take: 20,
					select: {
						id: true,
						createdAt: true,
						feature: true,
						detail: true,
					},
				},
				unlockedTemplates: {
					orderBy: { unlockedAt: "desc" },
					take: 50,
					select: {
						id: true,
						unlockedAt: true,
						templateId: true,
						template: { select: { name: true } },
					},
				},
				downloadGrants: {
					orderBy: { createdAt: "desc" },
					take: 50,
					select: {
						id: true,
						createdAt: true,
						reason: true,
						amount: true,
					},
				},
			},
		});

		if (!user) {
			throw new NotFoundError("USER", id);
		}

		return {
			id: user.id,
			email: user.email,
			name: user.name,
			image: user.image,
			plan: user.plan,
			role: user.role,
			isActive: user.isActive,
			subscriptionEnd: user.subscriptionEnd,
			downloadCredits: user.downloadCredits,
			freeDownloadsRemaining: user.freeDownloadsRemaining,
			maxCvs: user.maxCvs,
			iaRequestsUsed: user.iaRequestsUsed,
			lastIaReset: user.lastIaReset,
			lastLoginAt: user.lastLoginAt,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			cvCount: user._count.cvs,
			downloadCount: user._count.downloadEvents,
			hasProfile: user.profile != null,
			cvs: user.cvs.map((cv) => ({
				id: cv.id,
				title: cv.title,
				templateId: cv.templateId,
				templateName: cv.template.name,
				createdAt: cv.createdAt,
				updatedAt: cv.updatedAt,
			})),
			recentDownloads: user.downloadEvents.map((e) => ({
				id: e.id,
				createdAt: e.createdAt,
				variant: e.variant,
				cvId: e.cvId,
				cvTitle: e.cv?.title ?? null,
				templateId: e.templateId,
			})),
			recentAiEvents: user.aiEvents.map((e) => ({
				id: e.id,
				createdAt: e.createdAt,
				feature: e.feature,
				detail: e.detail,
			})),
			purchaseHistory: [
				...user.unlockedTemplates.map((t) => ({
					id: t.id,
					createdAt: t.unlockedAt,
					kind: "TEMPLATE" as const,
					label: t.template.name,
					amount: null,
				})),
				...user.downloadGrants.map((g) => ({
					id: g.id,
					createdAt: g.createdAt,
					kind: "FREE_GRANT" as const,
					label: grantReasonLabel(g.reason),
					amount: g.amount,
				})),
			].sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
			),
		};
	}

	/**
	 * Ajuste statut / quotas / abo (valeurs absolues).
	 * Au moins un champ doit être fourni.
	 */
	async updateUser(
		id: string,
		input: {
			isActive?: boolean;
			downloadCredits?: number;
			freeDownloadsRemaining?: number;
			plan?: PlanRole;
			subscriptionEnd?: Date | null;
		},
	): Promise<{
		id: string;
		isActive: boolean;
		downloadCredits: number;
		freeDownloadsRemaining: number;
		plan: PlanRole;
		subscriptionEnd: Date | null;
	}> {
		const hasIsActive = typeof input.isActive === "boolean";
		const hasCredits = typeof input.downloadCredits === "number";
		const hasFree = typeof input.freeDownloadsRemaining === "number";
		const hasPlan = input.plan != null;
		const hasSubEnd = input.subscriptionEnd !== undefined;

		if (
			!hasIsActive &&
			!hasCredits &&
			!hasFree &&
			!hasPlan &&
			!hasSubEnd
		) {
			throw new ValidationError("Aucun champ à mettre à jour");
		}
		if (hasCredits && input.downloadCredits! < 0) {
			throw new ValidationError("downloadCredits doit être ≥ 0");
		}
		if (hasFree && input.freeDownloadsRemaining! < 0) {
			throw new ValidationError("freeDownloadsRemaining doit être ≥ 0");
		}

		const existing = await prisma.user.findUnique({
			where: { id },
			select: { id: true, plan: true, subscriptionEnd: true },
		});
		if (!existing) {
			throw new NotFoundError("USER", id);
		}

		const nextPlan = hasPlan ? input.plan! : existing.plan;
		const premiumPlans: PlanRole[] = ["PREMIUM", "PREMIUM_PLUS_IA"];
		let nextSubEnd: Date | null | undefined = hasSubEnd
			? input.subscriptionEnd
			: undefined;

		if (hasPlan && !premiumPlans.includes(nextPlan) && !hasSubEnd) {
			nextSubEnd = null;
		}

		const effectiveSubEnd =
			nextSubEnd !== undefined
				? nextSubEnd
				: existing.subscriptionEnd;

		if (premiumPlans.includes(nextPlan) && !effectiveSubEnd) {
			throw new ValidationError(
				"Une date de fin d’abonnement est requise pour ce plan",
			);
		}

		const updated = await prisma.user.update({
			where: { id },
			data: {
				...(hasIsActive ? { isActive: input.isActive } : {}),
				...(hasCredits
					? { downloadCredits: input.downloadCredits }
					: {}),
				...(hasFree
					? { freeDownloadsRemaining: input.freeDownloadsRemaining }
					: {}),
				...(hasPlan ? { plan: nextPlan } : {}),
				...(nextSubEnd !== undefined
					? { subscriptionEnd: nextSubEnd }
					: {}),
			},
			select: {
				id: true,
				isActive: true,
				downloadCredits: true,
				freeDownloadsRemaining: true,
				plan: true,
				subscriptionEnd: true,
			},
		});

		return updated;
	}

	/**
	 * Reset soft : remet les consommables / compteur IA à zéro.
	 * Ne touche pas au compte, aux CV, à l’historique ni au plan.
	 */
	async softResetUser(id: string): Promise<{
		id: string;
		downloadCredits: number;
		freeDownloadsRemaining: number;
		iaRequestsUsed: number;
		lastIaReset: Date;
	}> {
		const existing = await prisma.user.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!existing) {
			throw new NotFoundError("USER", id);
		}

		return prisma.user.update({
			where: { id },
			data: {
				downloadCredits: 0,
				freeDownloadsRemaining: 0,
				iaRequestsUsed: 0,
				lastIaReset: new Date(),
			},
			select: {
				id: true,
				downloadCredits: true,
				freeDownloadsRemaining: true,
				iaRequestsUsed: true,
				lastIaReset: true,
			},
		});
	}
}

function grantReasonLabel(reason: string): string {
	switch (reason) {
		case "PROFILE_CREATED":
			return "Cadeau · profil créé";
		case "TEMPLATE_PURCHASED":
			return "Cadeau · achat template";
		case "FIRST_CV_SAVED":
			return "Cadeau · 1er CV sauvé";
		default:
			return reason;
	}
}

export const adminUserService = new AdminUserService();
