import { geminiService } from "./geminiService";
import { pdfPagesToImages, type PdfToImagesOptions } from "./pdfToImages";
import type { CvImportDraft } from "../schemas/cvImportDraft.schema";

export type ImportCvFromPdfOptions = PdfToImagesOptions & {
	model?: string;
};

/**
 * Pipeline import CV : PDF → PNG pages → Gemini vision → cvImportDraft.
 */
async function importCvFromPdf(
	pdfBytes: Uint8Array | ArrayBuffer | Buffer,
	options: ImportCvFromPdfOptions = {},
): Promise<{ draft: CvImportDraft; pageCount: number }> {
	const { model, ...pdfOptions } = options;
	const pages = await pdfPagesToImages(pdfBytes, pdfOptions);

	const draft = await geminiService.parseCvFromImages(
		pages.map((p) => ({
			mimeType: p.mimeType,
			base64: p.base64,
		})),
		model !== undefined ? { model } : {},
	);

	return { draft, pageCount: pages.length };
}

/** Objet mutable — espionnable en tests (vitest isolate:false). */
export const cvImportService = {
	importCvFromPdf,
};
