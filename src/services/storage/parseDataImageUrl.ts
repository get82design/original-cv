import { ValidationError } from "../errors";

const DATA_IMAGE_RE =
	/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i;

export type ParsedDataImage = {
	mimeType: "image/jpeg" | "image/png" | "image/webp";
	ext: "jpg" | "png" | "webp";
	buffer: Buffer;
};

function normalizeMime(
	mime: string,
): ParsedDataImage["mimeType"] {
	const m = mime.toLowerCase();
	if (m === "image/jpg" || m === "image/jpeg") return "image/jpeg";
	if (m === "image/png") return "image/png";
	if (m === "image/webp") return "image/webp";
	throw new ValidationError(`Unsupported image mime type: ${mime}`);
}

function extForMime(mime: ParsedDataImage["mimeType"]): ParsedDataImage["ext"] {
	if (mime === "image/png") return "png";
	if (mime === "image/webp") return "webp";
	return "jpg";
}

/** Décode un data URL image (jpeg/png/webp) en buffer. */
export function parseDataImageUrl(dataUrl: string): ParsedDataImage {
	const trimmed = dataUrl.trim();
	const match = trimmed.match(DATA_IMAGE_RE);
	if (!match?.[1] || !match[2]) {
		throw new ValidationError(
			"Preview must be a data:image/(jpeg|png|webp);base64,… URL",
		);
	}

	const mimeType = normalizeMime(match[1]);
	const buffer = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
	if (buffer.length === 0) {
		throw new ValidationError("Preview image is empty");
	}
	/** ~600 Ko décodés ≈ data URL ~800 Ko côté client */
	if (buffer.length > 600_000) {
		throw new ValidationError("Preview image is too large");
	}

	return { mimeType, ext: extForMime(mimeType), buffer };
}
