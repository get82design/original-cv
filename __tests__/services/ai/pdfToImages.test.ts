import { describe, expect, it } from "vitest";
import { pdfPagesToImages } from "../../../src/services/ai/pdfToImages";
import { ValidationError } from "../../../src/services/errors";

/** PDF 1 page minimal (Helvetica "Hello") */
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

describe("pdfPagesToImages", () => {
	it("renders at least one PNG page from a PDF", async () => {
		const pages = await pdfPagesToImages(minimalPdfBytes(), {
			maxPages: 1,
			scale: 1,
		});

		expect(pages).toHaveLength(1);
		expect(pages[0]?.pageNumber).toBe(1);
		expect(pages[0]?.mimeType).toBe("image/png");
		expect(pages[0]?.base64.length).toBeGreaterThan(100);
		expect(pages[0]?.dataUrl.startsWith("data:image/png")).toBe(true);
	}, 30_000);

	it("rejects an empty buffer", async () => {
		await expect(pdfPagesToImages(new Uint8Array())).rejects.toThrow(
			ValidationError,
		);
	});
});
