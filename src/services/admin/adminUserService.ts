import type { PlanRole, Prisma } from "../../../generated/prisma/client";
import type { UnlockMethod } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { parseUnlockGifts } from "../commons/templateAccess";
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
		/** Affichage humain (ex. « 2 free DL · 3 crédits ») */
		amountLabel: string | null;
		templateId?: string | undefined;
		method?: UnlockMethod | null | undefined;
	}>;
};

export class AdminUserService {
	async listUsers(input: {
		search?: string | undefined;
		isActive?: boolean | undefined;
		plan?: PlanRole | undefined;
		page?: number | undefined;
		pageSize?: number | undefined;
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
						method: true,
						templateId: true,
						template: {
							select: { name: true, unlockGifts: true },
						},
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

		const templateNameById = new Map(
			user.unlockedTemplates.map((t) => [
				t.templateId,
				t.template.name,
			]),
		);

		const missingGrantTemplateIds = new Set<string>();
		for (const g of user.downloadGrants) {
			for (const tid of templateIdsFromGrantReason(g.reason)) {
				if (!templateNameById.has(tid)) {
					missingGrantTemplateIds.add(tid);
				}
			}
		}
		if (missingGrantTemplateIds.size > 0) {
			const missing = await prisma.cVTemplate.findMany({
				where: { id: { in: [...missingGrantTemplateIds] } },
				select: { id: true, name: true },
			});
			for (const t of missing) {
				templateNameById.set(t.id, t.name);
			}
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
					amountLabel: unlockGiftsAmountLabel(
						t.method,
						t.template.unlockGifts,
					),
					templateId: t.templateId,
					method: t.method,
				})),
				...user.downloadGrants
					.filter((g) => !isTemplateUnlockGrantReason(g.reason))
					.map((g) => ({
					id: g.id,
					createdAt: g.createdAt,
					kind: "FREE_GRANT" as const,
					label: grantReasonLabel(g.reason, templateNameById),
					amount: g.amount,
					amountLabel:
						g.amount > 0 ? `${g.amount} free DL` : null,
				})),
			].sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
			),
		};
	}

	/**
	 * Ajuste statut / quotas / abo (valeurs absolues).
	 * Au moins un champ doit être fourni.
	 * @param actorUserId admin qui effectue l’action (journal crédits)
	 */
	async updateUser(
		id: string,
		input: {
			isActive?: boolean | undefined;
			downloadCredits?: number | undefined;
			freeDownloadsRemaining?: number | undefined;
			plan?: PlanRole | undefined;
			subscriptionEnd?: Date | null | undefined;
		},
		actorUserId?: string | null,
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
			select: {
				id: true,
				plan: true,
				subscriptionEnd: true,
				downloadCredits: true,
				freeDownloadsRemaining: true,
			},
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

		const data: {
			isActive?: boolean;
			downloadCredits?: number;
			freeDownloadsRemaining?: number;
			plan?: PlanRole;
			subscriptionEnd?: Date | null;
		} = {};
		if (hasIsActive) data.isActive = input.isActive!;
		if (hasCredits) data.downloadCredits = input.downloadCredits!;
		if (hasFree) data.freeDownloadsRemaining = input.freeDownloadsRemaining!;
		if (hasPlan) data.plan = nextPlan;
		if (nextSubEnd !== undefined) data.subscriptionEnd = nextSubEnd;

		const creditLogs: Prisma.AdminCreditLogCreateManyInput[] = [];
		if (hasCredits && input.downloadCredits! !== existing.downloadCredits) {
			creditLogs.push({
				kind: "DOWNLOAD_CREDITS",
				reason: "ADMIN_SET",
				before: existing.downloadCredits,
				after: input.downloadCredits!,
				delta: input.downloadCredits! - existing.downloadCredits,
				targetUserId: id,
				actorUserId: actorUserId ?? null,
			});
		}
		if (
			hasFree &&
			input.freeDownloadsRemaining! !== existing.freeDownloadsRemaining
		) {
			creditLogs.push({
				kind: "FREE_DOWNLOADS",
				reason: "ADMIN_SET",
				before: existing.freeDownloadsRemaining,
				after: input.freeDownloadsRemaining!,
				delta:
					input.freeDownloadsRemaining! -
					existing.freeDownloadsRemaining,
				targetUserId: id,
				actorUserId: actorUserId ?? null,
			});
		}

		const updated = await prisma.$transaction(async (tx) => {
			const row = await tx.user.update({
				where: { id },
				data,
				select: {
					id: true,
					isActive: true,
					downloadCredits: true,
					freeDownloadsRemaining: true,
					plan: true,
					subscriptionEnd: true,
				},
			});
			if (creditLogs.length > 0) {
				await tx.adminCreditLog.createMany({ data: creditLogs });
			}
			return row;
		});

		return updated;
	}

	/**
	 * Reset soft : remet les consommables / compteur IA à zéro.
	 * Ne touche pas au compte, aux CV, à l’historique ni au plan.
	 */
	async softResetUser(
		id: string,
		actorUserId?: string | null,
	): Promise<{
		id: string;
		downloadCredits: number;
		freeDownloadsRemaining: number;
		iaRequestsUsed: number;
		lastIaReset: Date;
	}> {
		const existing = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				downloadCredits: true,
				freeDownloadsRemaining: true,
			},
		});
		if (!existing) {
			throw new NotFoundError("USER", id);
		}

		const creditLogs: Prisma.AdminCreditLogCreateManyInput[] = [];
		if (existing.downloadCredits !== 0) {
			creditLogs.push({
				kind: "DOWNLOAD_CREDITS",
				reason: "ADMIN_SOFT_RESET",
				before: existing.downloadCredits,
				after: 0,
				delta: -existing.downloadCredits,
				targetUserId: id,
				actorUserId: actorUserId ?? null,
			});
		}
		if (existing.freeDownloadsRemaining !== 0) {
			creditLogs.push({
				kind: "FREE_DOWNLOADS",
				reason: "ADMIN_SOFT_RESET",
				before: existing.freeDownloadsRemaining,
				after: 0,
				delta: -existing.freeDownloadsRemaining,
				targetUserId: id,
				actorUserId: actorUserId ?? null,
			});
		}

		return prisma.$transaction(async (tx) => {
			const row = await tx.user.update({
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
			if (creditLogs.length > 0) {
				await tx.adminCreditLog.createMany({ data: creditLogs });
			}
			return row;
		});
	}
}

function isTemplateUnlockGrantReason(reason: string): boolean {
	return (
		reason.startsWith("TEMPLATE_UNLOCK:") ||
		reason.startsWith("TEMPLATE_UNLOCK_BULK:")
	);
}

function unlockGiftsAmountLabel(
	method: UnlockMethod,
	unlockGifts: unknown,
): string | null {
	const gifts = parseUnlockGifts(unlockGifts);
	if (!gifts) return null;
	const free = gifts.freeDownloads ?? 0;
	/** Cadeau crédits uniquement hors paiement crédits */
	const credits =
		method === "CREDITS" ? 0 : (gifts.downloadCredits ?? 0);
	const parts: string[] = [];
	if (free > 0) parts.push(`${free} free DL`);
	if (credits > 0) {
		parts.push(`${credits} crédit${credits > 1 ? "s" : ""}`);
	}
	return parts.length > 0 ? parts.join(" · ") : null;
}

function templateIdsFromGrantReason(reason: string): string[] {
	if (reason.startsWith("TEMPLATE_UNLOCK_BULK:")) {
		return reason
			.slice("TEMPLATE_UNLOCK_BULK:".length)
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
	}
	if (reason.startsWith("TEMPLATE_UNLOCK:")) {
		const id = reason.slice("TEMPLATE_UNLOCK:".length).trim();
		return id ? [id] : [];
	}
	return [];
}

function grantReasonLabel(
	reason: string,
	templateNameById?: ReadonlyMap<string, string>,
): string {
	if (reason.startsWith("TEMPLATE_UNLOCK_BULK:")) {
		const ids = templateIdsFromGrantReason(reason);
		const names = ids
			.map((id) => templateNameById?.get(id))
			.filter((n): n is string => !!n);
		if (names.length > 0) {
			return `Free DL · unlock ${names.join(", ")}`;
		}
		return "Free DL · unlocks groupés";
	}
	if (reason.startsWith("TEMPLATE_UNLOCK:")) {
		const [id] = templateIdsFromGrantReason(reason);
		const name = id ? templateNameById?.get(id) : undefined;
		return name
			? `Free DL · unlock ${name}`
			: "Free DL · unlock template";
	}
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
