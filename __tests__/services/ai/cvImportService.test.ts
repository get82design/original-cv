import { afterEach, describe, expect, it, vi } from "vitest";
import { cvImportService } from "../../../src/services/ai/cvImportService";
import { geminiService } from "../../../src/services/ai/geminiService";
import { pdfPagesToImages } from "../../../src/services/ai/pdfToImages";

/** PDF 1 page minimal (même fixture que pdfToImages.test) */
function minimalPdfBytes(): Uint8Array {
	const content = `BT /F1 24 Tf 100 100 Td (Hello) Tj ET`;
	const objects = [
		"1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
		"2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n",
		"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n",
		`4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream\nendobj\n`,
		"5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
	];

	let body = "%PDF-1.1\n";
	const offsets = [0];
	for (const obj of objects) {
		offsets.push(Buffer.byteLength(body, "utf8"));
		body += obj;
	}
	const xrefStart = Buffer.byteLength(body, "utf8");
	let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (let i = 1; i <= objects.length; i++) {
		xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
	}
	body += xref;
	body += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
	body += `startxref\n${xrefStart}\n%%EOF\n`;
	return new TextEncoder().encode(body);
}

const emptyDraft = {
	identity: { firstName: "Ada" },
	experiences: [],
	educations: [],
	formations: [],
	languages: [],
	skills: [],
	certifications: [],
	socialMedias: [],
	warnings: [],
};

describe("cvImportService", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("pipelines PDF pages into gemini parseCvFromImages", async () => {
		const parseSpy = vi.spyOn(geminiService, "parseCvFromImages").mockResolvedValue(emptyDraft);

		const result = await cvImportService.importCvFromPdf(minimalPdfBytes(), {
			maxPages: 1,
			scale: 1,
		});

		expect(result.pageCount).toBe(1);
		expect(result.draft.identity.firstName).toBe("Ada");
		expect(parseSpy).toHaveBeenCalledOnce();
		const [images, options] = parseSpy.mock.calls[0]!;
		expect(images).toHaveLength(1);
		expect(images[0]?.mimeType).toMatch(/^image\//);
		expect(images[0]?.base64.length).toBeGreaterThan(0);
		expect(options).toEqual({});
	});

	it("forwards model option to gemini when provided", async () => {
		const parseSpy = vi.spyOn(geminiService, "parseCvFromImages").mockResolvedValue(emptyDraft);

		await cvImportService.importCvFromPdf(minimalPdfBytes(), {
			maxPages: 1,
			scale: 1,
			model: "gemini-test-model",
		});

		expect(parseSpy).toHaveBeenCalledWith(expect.any(Array), { model: "gemini-test-model" });
	});

	it("passes through pageCount from rendered pages", async () => {
		vi.spyOn(geminiService, "parseCvFromImages").mockResolvedValue(emptyDraft);
		// Smoke: real render still returns ≥1 page for minimal PDF
		const pages = await pdfPagesToImages(minimalPdfBytes(), {
			maxPages: 1,
			scale: 1,
		});
		expect(pages.length).toBeGreaterThanOrEqual(1);

		const result = await cvImportService.importCvFromPdf(minimalPdfBytes(), {
			maxPages: 1,
			scale: 1,
		});
		expect(result.pageCount).toBe(pages.length);
	});
});
