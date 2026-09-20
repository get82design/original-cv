import { z } from "zod";
import { cvImportService } from "../../../src/services/ai/cvImportService";
import { geminiService } from "../../../src/services/ai/geminiService";
import { cvRewriteSectionTypeSchema } from "../../../src/services/schemas/cvRewriteSection.schema";
import { userService } from "../../../src/services/user/userService";
import { protectedProcedure, router } from "../trpc";

export const aiRouter = router({
	/** Valide la clé Google AI Studio (server-only). */
	ping: protectedProcedure.query(() => geminiService.ping()),

	/**
	 * Import CV depuis un PDF (base64) → draft Zod.
	 * PDF → PNG → Gemini vision → cvImportDraftSchema.
	 */
	importCvFromPdf: protectedProcedure
		.input(
			z.object({
				pdfBase64: z.string().min(1),
				maxPages: z.number().int().min(1).max(5).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const bytes = Uint8Array.from(
				Buffer.from(input.pdfBase64, "base64"),
			);
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
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const review = await geminiService.reviewCv(input.cvText);
			await userService.logAiUsage(ctx.session.user.id, "REVIEW_CV");
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
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const rewrite = await geminiService.rewriteSection({
				sectionType: input.sectionType,
				sectionLabel: input.sectionLabel,
				sourceText: input.sourceText,
			});
			await userService.logAiUsage(
				ctx.session.user.id,
				"REWRITE_SECTION",
				input.sectionLabel,
			);
			return { rewrite };
		}),
});
