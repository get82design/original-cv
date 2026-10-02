import { z } from "zod";
import { assertCvImportQuota } from "../../../src/services/ai/cvImportQuota";
import {
	aiBillingService,
	type BillableAiFeature,
} from "../../../src/services/ai/aiBillingService";
import { cvImportService } from "../../../src/services/ai/cvImportService";
import { geminiService } from "../../../src/services/ai/geminiService";
import { cvRewriteSectionTypeSchema } from "../../../src/services/schemas/cvRewriteSection.schema";
import { userService } from "../../../src/services/user/userService";
import { protectedProcedure, router } from "../trpc";

const aiPaymentChoiceSchema = z.enum(["free", "paid"]);

const billableFeatureSchema = z.enum([
	"REVIEW_CV",
	"REWRITE_SECTION",
	"COVER_LETTER",
	"MATCH_JOB",
	"MATCH_ROME_FICHE",
]);

/**
 * Import PDF : gratuit plafonné (assertCvImportQuota).
 * Review / rewrite : débit crédits (free ou paid) au choix user.
 */
export const aiRouter = router({
	/** Valide la clé Google AI Studio (server-only). */
	ping: protectedProcedure.query(() => geminiService.ping()),

	/** Prix + soldes pour le dialog de choix free / paid. */
	getBillingOptions: protectedProcedure
		.input(z.object({ feature: billableFeatureSchema }))
		.query(({ ctx, input }) =>
			aiBillingService.getBillingOptions(ctx.session.user.id, input.feature as BillableAiFeature),
		),

	/** Tarifs crédits des services IA (hors import) — affichage catalogue. */
	listFeaturePrices: protectedProcedure.query(() => aiBillingService.listPrices()),

	/**
	 * Import CV depuis un PDF (base64) → draft Zod.
	 * Gratuit, plafonné (2/24h, 5/7j, 10/30j) — check avant Gemini.
	 */
	importCvFromPdf: protectedProcedure
		.input(
			z.object({
				pdfBase64: z.string().min(1),
				maxPages: z.number().int().min(1).max(5).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await assertCvImportQuota(ctx.session.user.id);
			const bytes = Uint8Array.from(Buffer.from(input.pdfBase64, "base64"));
			const result = await cvImportService.importCvFromPdf(bytes, {
				maxPages: input.maxPages ?? 3,
			});
			await userService.logAiUsage(ctx.session.user.id, "IMPORT_CV");
			return result;
		}),

	/**
	 * Relecture générale IA — le client envoie le CV déjà aplati en texte.
	 */
	reviewCv: protectedProcedure
		.input(
			z.object({
				cvText: z.string().trim().min(1).max(50_000),
				paymentMethod: aiPaymentChoiceSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			await aiBillingService.assertCanPay(userId, "REVIEW_CV", input.paymentMethod);
			const review = await geminiService.reviewCv(input.cvText);
			await aiBillingService.consumeAndLog({
				userId,
				feature: "REVIEW_CV",
				choice: input.paymentMethod,
			});
			return { review };
		}),

	/**
	 * Reformulation d’une section — le client envoie le texte source extrait.
	 */
	rewriteSection: protectedProcedure
		.input(
			z.object({
				sectionType: cvRewriteSectionTypeSchema,
				sectionLabel: z.string().trim().min(1).max(120),
				sourceText: z.string().trim().min(1).max(50_000),
				paymentMethod: aiPaymentChoiceSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			await aiBillingService.assertCanPay(userId, "REWRITE_SECTION", input.paymentMethod);
			const rewrite = await geminiService.rewriteSection({
				sectionType: input.sectionType,
				sectionLabel: input.sectionLabel,
				sourceText: input.sourceText,
			});
			await aiBillingService.consumeAndLog({
				userId,
				feature: "REWRITE_SECTION",
				choice: input.paymentMethod,
				detail: input.sectionLabel,
			});
			return { rewrite };
		}),

	/**
	 * Lettre de motivation IA — CV aplati + ciblage optionnel (entreprise / poste / annonce).
	 */
	coverLetter: protectedProcedure
		.input(
			z.object({
				cvText: z.string().trim().min(1).max(50_000),
				paymentMethod: aiPaymentChoiceSchema,
				companyName: z.string().trim().max(120).optional(),
				jobTitle: z.string().trim().max(120).optional(),
				jobOffer: z.string().trim().max(10_000).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			await aiBillingService.assertCanPay(userId, "COVER_LETTER", input.paymentMethod);
			const coverLetter = await geminiService.coverLetter({
				cvText: input.cvText,
				...(input.companyName ? { companyName: input.companyName } : {}),
				...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
				...(input.jobOffer ? { jobOffer: input.jobOffer } : {}),
			});
			const detailParts = [input.jobTitle, input.companyName].filter(Boolean);
			await aiBillingService.consumeAndLog({
				userId,
				feature: "COVER_LETTER",
				choice: input.paymentMethod,
				...(detailParts.length > 0 ? { detail: detailParts.join(" · ") } : {}),
			});
			return { coverLetter };
		}),

	/**
	 * Comparaison CV ↔ annonce — CV aplati + texte d’offre obligatoire.
	 */
	matchJob: protectedProcedure
		.input(
			z.object({
				cvText: z.string().trim().min(1).max(50_000),
				paymentMethod: aiPaymentChoiceSchema,
				jobOffer: z.string().trim().min(1).max(10_000),
				companyName: z.string().trim().max(120).optional(),
				jobTitle: z.string().trim().max(120).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			await aiBillingService.assertCanPay(userId, "MATCH_JOB", input.paymentMethod);
			const match = await geminiService.matchJob({
				cvText: input.cvText,
				jobOffer: input.jobOffer,
				...(input.companyName ? { companyName: input.companyName } : {}),
				...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
			});
			const detailParts = [input.jobTitle, input.companyName].filter(Boolean);
			await aiBillingService.consumeAndLog({
				userId,
				feature: "MATCH_JOB",
				choice: input.paymentMethod,
				...(detailParts.length > 0 ? { detail: detailParts.join(" · ") } : {}),
			});
			return { match };
		}),

	/**
	 * Comparaison CV ↔ fiche métier ROME — CV aplati + texte fiche.
	 */
	matchRomeFiche: protectedProcedure
		.input(
			z.object({
				cvText: z.string().trim().min(1).max(50_000),
				paymentMethod: aiPaymentChoiceSchema,
				ficheText: z.string().trim().min(1).max(30_000),
				codeRome: z.string().trim().max(8).optional(),
				libelleRome: z.string().trim().max(200).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			await aiBillingService.assertCanPay(userId, "MATCH_ROME_FICHE", input.paymentMethod);
			const match = await geminiService.matchRomeFiche({
				cvText: input.cvText,
				ficheText: input.ficheText,
				...(input.codeRome ? { codeRome: input.codeRome } : {}),
				...(input.libelleRome ? { libelleRome: input.libelleRome } : {}),
			});
			const detailParts = [input.codeRome, input.libelleRome].filter(Boolean);
			await aiBillingService.consumeAndLog({
				userId,
				feature: "MATCH_ROME_FICHE",
				choice: input.paymentMethod,
				...(detailParts.length > 0 ? { detail: detailParts.join(" · ") } : {}),
			});
			return { match };
		}),
});
