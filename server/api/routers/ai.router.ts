import { z } from "zod";
import { cvImportService } from "../../../src/services/ai/cvImportService";
import { geminiService } from "../../../src/services/ai/geminiService";
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
		.mutation(async ({ input }) => {
			const bytes = Uint8Array.from(
				Buffer.from(input.pdfBase64, "base64"),
			);
			return cvImportService.importCvFromPdf(bytes, {
				maxPages: input.maxPages ?? 3,
			});
		}),
});
