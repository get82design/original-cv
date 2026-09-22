import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { canUnlockTemplate, parseUnlockGifts } from "./templateAccess";

export type UnlockPaymentMethod = "gift" | "credits" | "stripe";

function toDbMethod(method: UnlockPaymentMethod) {
	if (method === "credits") return "CREDITS" as const;
	if (method === "stripe") return "STRIPE" as const;
	return "GIFT" as const;
}

function unlockGrantReason(templateId: string) {
	return `TEMPLATE_UNLOCK:${templateId}`;
}

export class UnlockedTemplateService {
	/**
	 * Débloque un template.
	 * - gift (admin / Stripe plus tard) : unlockGifts complets (free DL + crédits)
	 * - credits : consomme priceCredits, cadeaux free DL seulement (pas de crédits rendus)
	 */
	async unlockTemplate(userId: string, templateId: string, opts: { method: UnlockPaymentMethod }) {
		const method = opts.method;

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				downloadCredits: true,
			},
		});

		if (!user) {
			throw new NotFoundError("USER", userId);
		}

		const template = await prisma.cVTemplate.findUnique({
			where: { id: templateId },
			select: {
				id: true,
				isActive: true,
				isPremium: true,
				priceCredits: true,
				unlockGifts: true,
			},
		});

		if (!template) {
			throw new NotFoundError("CV_TEMPLATE", templateId);
		}

		if (!canUnlockTemplate(template)) {
			throw new ValidationError("Ce modèle n’est pas disponible");
		}

		const existing = await prisma.unlockedTemplate.findUnique({
			where: {
				userId_templateId: {
					userId,
					templateId,
				},
			},
		});

		if (existing) {
			throw new ConflictError("TEMPLATE_ALREADY_UNLOCKED", "Template already unlocked");
		}

		const priceCredits = template.priceCredits;
		if (method === "credits") {
			if (priceCredits == null || priceCredits < 1) {
				throw new ValidationError("Ce modèle n’est pas achetable en crédits");
			}
			if (user.downloadCredits < priceCredits) {
				throw new ValidationError(
					`Crédits insuffisants (il faut ${priceCredits}, vous en avez ${user.downloadCredits})`,
				);
			}
		}

		const gifts = parseUnlockGifts(template.unlockGifts);
		const freeGift = gifts?.freeDownloads ?? 0;
		/** Cadeau crédits uniquement si unlock « gift » (pas si payé en crédits). */
		const creditGift = method === "gift" ? (gifts?.downloadCredits ?? 0) : 0;

		return prisma.$transaction(async (tx) => {
			const unlocked = await tx.unlockedTemplate.create({
				data: {
					userId,
					templateId,
					method: toDbMethod(method),
				},
				select: {
					id: true,
					userId: true,
					templateId: true,
					method: true,
					unlockedAt: true,
					template: true,
				},
			});

			const userData: Prisma.UserUpdateInput = {};

			if (method === "credits" && priceCredits != null && priceCredits > 0) {
				userData.downloadCredits = { decrement: priceCredits };
			} else if (creditGift > 0) {
				userData.downloadCredits = { increment: creditGift };
			}

			if (freeGift > 0) {
				userData.freeDownloadsRemaining = { increment: freeGift };
			}

			if (Object.keys(userData).length > 0) {
				await tx.user.update({
					where: { id: userId },
					data: userData,
				});
			}

			if (freeGift > 0) {
				await tx.downloadGrant.create({
					data: {
						userId,
						reason: unlockGrantReason(templateId),
						amount: freeGift,
					},
				});
			}

			return unlocked;
		});
	}

	async findAllByUser(userId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundError("USER", userId);
		}

		return prisma.unlockedTemplate.findMany({
			where: {
				userId,
			},
			include: {
				template: true,
			},
			orderBy: {
				unlockedAt: "desc",
			},
		});
	}

	async hasUnlocked(userId: string, templateId: string) {
		const unlocked = await prisma.unlockedTemplate.findUnique({
			where: {
				userId_templateId: {
					userId,
					templateId,
				},
			},
		});

		return unlocked !== null;
	}

	async unlockManyTemplates(userId: string, templateIds: string[]) {
		const uniqueIds = [...new Set(templateIds)];
		if (uniqueIds.length === 0) {
			return { count: 0 };
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundError("USER", userId);
		}

		const templates = await prisma.cVTemplate.findMany({
			where: { id: { in: uniqueIds } },
			select: {
				id: true,
				isActive: true,
				isPremium: true,
				unlockGifts: true,
			},
		});

		if (templates.length !== uniqueIds.length) {
			const found = new Set(templates.map((t) => t.id));
			const missing = uniqueIds.find((id) => !found.has(id));
			throw new NotFoundError("CV_TEMPLATE", missing ?? "unknown");
		}

		for (const t of templates) {
			if (!canUnlockTemplate(t)) {
				throw new ValidationError(`Le modèle ${t.id} n’est pas disponible`);
			}
		}

		const already = await prisma.unlockedTemplate.findMany({
			where: {
				userId,
				templateId: { in: uniqueIds },
			},
			select: { templateId: true },
		});
		const alreadySet = new Set(already.map((a) => a.templateId));
		const toUnlock = uniqueIds.filter((id) => !alreadySet.has(id));

		if (toUnlock.length === 0) {
			return { count: 0 };
		}

		const byId = new Map(templates.map((t) => [t.id, t]));

		return prisma.$transaction(async (tx) => {
			await tx.unlockedTemplate.createMany({
				data: toUnlock.map((templateId) => ({
					userId,
					templateId,
					method: "GIFT",
				})),
				skipDuplicates: true,
			});

			let freeTotal = 0;
			let creditTotal = 0;
			for (const id of toUnlock) {
				const t = byId.get(id);
				const gifts = parseUnlockGifts(t?.unlockGifts ?? null);
				freeTotal += gifts?.freeDownloads ?? 0;
				creditTotal += gifts?.downloadCredits ?? 0;
			}

			if (freeTotal > 0 || creditTotal > 0) {
				await tx.user.update({
					where: { id: userId },
					data: {
						...(freeTotal > 0
							? {
									freeDownloadsRemaining: {
										increment: freeTotal,
									},
								}
							: {}),
						...(creditTotal > 0 ? { downloadCredits: { increment: creditTotal } } : {}),
					},
				});
			}

			if (freeTotal > 0) {
				await tx.downloadGrant.create({
					data: {
						userId,
						reason: `TEMPLATE_UNLOCK_BULK:${toUnlock.join(",")}`,
						amount: freeTotal,
					},
				});
			}

			return { count: toUnlock.length };
		});
	}

	async delete(userId: string, templateId: string) {
		const unlocked = await prisma.unlockedTemplate.findUnique({
			where: {
				userId_templateId: {
					userId,
					templateId,
				},
			},
		});

		if (!unlocked) {
			throw new NotFoundError("UNLOCKED_TEMPLATE", templateId);
		}

		return prisma.unlockedTemplate.delete({
			where: {
				userId_templateId: {
					userId,
					templateId,
				},
			},
		});
	}
}

export const unlockedTemplateService = new UnlockedTemplateService();
