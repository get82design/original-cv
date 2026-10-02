import { prisma } from "../../../lib/prisma";
import type { AiFeature, AiPaymentMethod } from "../../../generated/prisma/client";
import { ValidationError } from "../errors";

/** Features facturées en crédits (hors import quotas). */
export const BILLABLE_AI_FEATURES = [
	"REVIEW_CV",
	"REWRITE_SECTION",
	"COVER_LETTER",
	"MATCH_JOB",
	"MATCH_ROME_FICHE",
] as const satisfies readonly AiFeature[];

export type BillableAiFeature = (typeof BILLABLE_AI_FEATURES)[number];

export type AiCreditPaymentChoice = "free" | "paid";

const choiceToMethod: Record<AiCreditPaymentChoice, AiPaymentMethod> = {
	free: "FREE",
	paid: "PAID",
};

export function isBillableAiFeature(feature: AiFeature): feature is BillableAiFeature {
	return (BILLABLE_AI_FEATURES as readonly string[]).includes(feature);
}

export type AiFeaturePriceRow = {
	feature: BillableAiFeature;
	costFree: number | null;
	costPaid: number | null;
};

export type AiBillingOptions = {
	feature: BillableAiFeature;
	costFree: number | null;
	costPaid: number | null;
	downloadCredits: number;
	freeDownloadsRemaining: number;
	canPayFree: boolean;
	canPayPaid: boolean;
};

function requireBillable(feature: AiFeature): BillableAiFeature {
	if (!isBillableAiFeature(feature)) {
		throw new ValidationError(`La feature ${feature} n’est pas facturée en crédits`);
	}
	return feature;
}

export class AiBillingService {
	async listPrices(): Promise<AiFeaturePriceRow[]> {
		const rows = await prisma.aiFeaturePrice.findMany({
			where: { feature: { in: [...BILLABLE_AI_FEATURES] } },
		});
		const byFeature = new Map(rows.map((r) => [r.feature, r]));
		return BILLABLE_AI_FEATURES.map((feature) => {
			const row = byFeature.get(feature);
			return {
				feature,
				costFree: row?.costFree ?? null,
				costPaid: row?.costPaid ?? null,
			};
		});
	}

	async upsertPrice(input: {
		feature: BillableAiFeature;
		costFree: number | null;
		costPaid: number | null;
	}): Promise<AiFeaturePriceRow> {
		if (input.costFree != null && input.costFree < 1) {
			throw new ValidationError("costFree doit être ≥ 1 ou null");
		}
		if (input.costPaid != null && input.costPaid < 1) {
			throw new ValidationError("costPaid doit être ≥ 1 ou null");
		}
		if (input.costFree == null && input.costPaid == null) {
			throw new ValidationError("Au moins un tarif (free ou paid) doit être défini");
		}

		const row = await prisma.aiFeaturePrice.upsert({
			where: { feature: input.feature },
			create: {
				feature: input.feature,
				costFree: input.costFree,
				costPaid: input.costPaid,
			},
			update: {
				costFree: input.costFree,
				costPaid: input.costPaid,
			},
		});
		return {
			feature: input.feature,
			costFree: row.costFree,
			costPaid: row.costPaid,
		};
	}

	async getBillingOptions(userId: string, feature: AiFeature): Promise<AiBillingOptions> {
		const billable = requireBillable(feature);
		const [price, user] = await Promise.all([
			prisma.aiFeaturePrice.findUnique({ where: { feature: billable } }),
			prisma.user.findUniqueOrThrow({
				where: { id: userId },
				select: {
					downloadCredits: true,
					freeDownloadsRemaining: true,
				},
			}),
		]);

		const costFree = price?.costFree ?? null;
		const costPaid = price?.costPaid ?? null;

		return {
			feature: billable,
			costFree,
			costPaid,
			downloadCredits: user.downloadCredits,
			freeDownloadsRemaining: user.freeDownloadsRemaining,
			canPayFree: costFree != null && user.freeDownloadsRemaining >= costFree,
			canPayPaid: costPaid != null && user.downloadCredits >= costPaid,
		};
	}

	/** Vérifie solde + tarif avant l’appel Gemini. */
	async assertCanPay(
		userId: string,
		feature: AiFeature,
		choice: AiCreditPaymentChoice,
	): Promise<{ creditsSpent: number; paymentMethod: AiPaymentMethod }> {
		const options = await this.getBillingOptions(userId, feature);
		return this.resolvePayment(options, choice);
	}

	/**
	 * Débite les crédits et crée l’AiEvent (après succès Gemini).
	 * Re-vérifie le solde atomiquement.
	 */
	async consumeAndLog(input: {
		userId: string;
		feature: BillableAiFeature;
		choice: AiCreditPaymentChoice;
		detail?: string | undefined;
	}): Promise<{ creditsSpent: number; paymentMethod: AiPaymentMethod }> {
		const options = await this.getBillingOptions(input.userId, input.feature);
		const { creditsSpent, paymentMethod } = this.resolvePayment(options, input.choice);
		const trimmed = input.detail?.trim();

		await prisma.$transaction(async (tx) => {
			const user = await tx.user.findUniqueOrThrow({
				where: { id: input.userId },
				select: {
					downloadCredits: true,
					freeDownloadsRemaining: true,
				},
			});

			if (paymentMethod === "FREE") {
				if (user.freeDownloadsRemaining < creditsSpent) {
					throw new ValidationError(
						`Crédits gratuits insuffisants (il faut ${creditsSpent}, vous en avez ${user.freeDownloadsRemaining})`,
					);
				}
				await tx.user.update({
					where: { id: input.userId },
					data: {
						freeDownloadsRemaining: { decrement: creditsSpent },
						iaRequestsUsed: { increment: 1 },
					},
				});
			} else {
				if (user.downloadCredits < creditsSpent) {
					throw new ValidationError(
						`Crédits payants insuffisants (il faut ${creditsSpent}, vous en avez ${user.downloadCredits})`,
					);
				}
				await tx.user.update({
					where: { id: input.userId },
					data: {
						downloadCredits: { decrement: creditsSpent },
						iaRequestsUsed: { increment: 1 },
					},
				});
			}

			await tx.aiEvent.create({
				data: {
					userId: input.userId,
					feature: input.feature,
					paymentMethod,
					creditsSpent,
					...(trimmed ? { detail: trimmed.slice(0, 120) } : {}),
				},
			});
		});

		return { creditsSpent, paymentMethod };
	}

	private resolvePayment(
		options: AiBillingOptions,
		choice: AiCreditPaymentChoice,
	): { creditsSpent: number; paymentMethod: AiPaymentMethod } {
		if (choice === "free") {
			if (options.costFree == null) {
				throw new ValidationError("Ce service n’accepte pas les crédits gratuits");
			}
			if (!options.canPayFree) {
				throw new ValidationError(
					`Crédits gratuits insuffisants (il faut ${options.costFree}, vous en avez ${options.freeDownloadsRemaining})`,
				);
			}
			return {
				creditsSpent: options.costFree,
				paymentMethod: choiceToMethod.free,
			};
		}

		if (options.costPaid == null) {
			throw new ValidationError("Ce service n’accepte pas les crédits payants");
		}
		if (!options.canPayPaid) {
			throw new ValidationError(
				`Crédits payants insuffisants (il faut ${options.costPaid}, vous en avez ${options.downloadCredits})`,
			);
		}
		return {
			creditsSpent: options.costPaid,
			paymentMethod: choiceToMethod.paid,
		};
	}
}

export const aiBillingService = new AiBillingService();
