import {
	createIsomorphicCanvasFactory,
	definePDFJSModule,
	getDocumentProxy,
	renderPageAsImage,
} from "unpdf";
import { ValidationError } from "../errors";

export type PdfPageImage = {
	pageNumber: number;
	mimeType: "image/png";
	/** Base64 sans préfixe data: — prêt pour Gemini */
	base64: string;
	dataUrl: string;
};

export type PdfToImagesOptions = {
	/** @default 3 */
	maxPages?: number;
	/** @default 2 */
	scale?: number;
};

let pdfjsReady: Promise<void> | null = null;

/**
 * pdfjs-dist ≥ 4 utilise Promise.withResolvers (Node 22+ / navigateurs récents).
 * Le build « legacy » ne le polyfill plus correctement → nécessaire sous Node 20.
 */
function polyfillPromiseWithResolvers() {
	if (typeof Promise.withResolvers === "function") return;

	Promise.withResolvers = function withResolvers<T = unknown>() {
		let resolve!: (value: T | PromiseLike<T>) => void;
		let reject!: (reason?: unknown) => void;
		const promise = new Promise<T>((res, rej) => {
			resolve = res;
			reject = rej;
		});
		return { promise, resolve, reject };
	};
}

async function ensurePdfjs() {
	if (!pdfjsReady) {
		polyfillPromiseWithResolvers();
		// Legacy build : compatible Node (évite Uint8Array.toHex du build moderne)
		pdfjsReady = definePDFJSModule(() => import("pdfjs-dist/legacy/build/pdf.mjs")).then(
			() => undefined,
		);
	}
	await pdfjsReady;
}

/**
 * Convertit les premières pages d’un PDF en PNG (vision LLM).
 * Server-only — nécessite @napi-rs/canvas + pdfjs-dist.
 */
export async function pdfPagesToImages(
	pdfBytes: Uint8Array | ArrayBuffer | Buffer,
	options: PdfToImagesOptions = {},
): Promise<PdfPageImage[]> {
	const maxPages = options.maxPages ?? 3;
	const scale = options.scale ?? 2;

	if (maxPages < 1) {
		throw new ValidationError("maxPages must be at least 1");
	}

	// pdf.js refuse Buffer (même s’il étend Uint8Array) — toujours un Uint8Array « pur »
	const bytes = Buffer.isBuffer(pdfBytes)
		? new Uint8Array(pdfBytes)
		: pdfBytes instanceof ArrayBuffer
			? new Uint8Array(pdfBytes)
			: pdfBytes instanceof Uint8Array
				? pdfBytes
				: new Uint8Array(pdfBytes);

	if (bytes.byteLength === 0) {
		throw new ValidationError("PDF file is empty");
	}

	await ensurePdfjs();

	const canvasImport = () => import("@napi-rs/canvas");
	const CanvasFactory = await createIsomorphicCanvasFactory(canvasImport);
	const pdf = await getDocumentProxy(bytes, { CanvasFactory });

	const pageCount = Math.min(pdf.numPages, maxPages);
	const pages: PdfPageImage[] = [];

	for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
		const dataUrl = (await renderPageAsImage(pdf, pageNumber, {
			canvasImport,
			scale,
			toDataURL: true,
		})) as string;

		const base64 = dataUrl.includes(",") ? dataUrl.slice(dataUrl.indexOf(",") + 1) : dataUrl;

		pages.push({
			pageNumber,
			mimeType: "image/png",
			base64,
			dataUrl,
		});
	}

	return pages;
}
