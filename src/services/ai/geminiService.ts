import { GoogleGenerativeAI } from "@google/generative-ai";
import type { z } from "zod";
import {
	buildCvImportSystemPrompt,
	cvImportDraftSchema,
	type CvImportDraft,
} from "../schemas/cvImportDraft.schema";
import {
	buildCvReviewSystemPrompt,
	cvReviewSchema,
	type CvReview,
} from "../schemas/cvReview.schema";
import { ValidationError } from "../errors";

const DEFAULT_MODEL = "gemini-3.6-flash";
const MAX_ATTEMPTS = 2; // 1 appel + 1 retry

export type CvImportImageInput = {
	mimeType: "image/png" | "image/jpeg" | "image/webp";
	/** Base64 sans préfixe data: */
	base64: string;
};

function getApiKey() {
	const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!key) {
		throw new ValidationError(
			"GOOGLE_GENERATIVE_AI_API_KEY is not configured",
		);
	}
	return key;
}

function extractJsonText(raw: string): string {
	const trimmed = raw.trim();
	const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fenced?.[1]) return fenced[1].trim();
	const start = trimmed.indexOf("{");
	const end = trimmed.lastIndexOf("}");
	if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
	return trimmed;
}

function formatZodIssues(
	issues: { path: PropertyKey[]; message: string }[],
): string {
	return issues
		.slice(0, 8)
		.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
		.join("\n");
}

type ParseOutcome<T> =
	| { ok: true; data: T }
	| { ok: false; reason: string };

function parseJsonWithSchema<T>(
	raw: string,
	schema: z.ZodType<T>,
): ParseOutcome<T> {
	let json: unknown;
	try {
		json = JSON.parse(extractJsonText(raw));
	} catch {
		return { ok: false, reason: "Invalid JSON (parse failed)" };
	}

	const parsed = schema.safeParse(json);
	if (!parsed.success) {
		return { ok: false, reason: formatZodIssues(parsed.error.issues) };
	}
	return { ok: true, data: parsed.data };
}

export class GeminiService {
	private client() {
		return new GoogleGenerativeAI(getApiKey());
	}

	private jsonModel(model: string) {
		return this.client().getGenerativeModel({
			model,
			generationConfig: {
				responseMimeType: "application/json",
				temperature: 0.2,
			},
		});
	}

	/** Ping minimal — valide la clé API. */
	async ping(model = DEFAULT_MODEL) {
		const generativeModel = this.client().getGenerativeModel({ model });
		const result = await generativeModel.generateContent(
			"Réponds uniquement par le mot OK",
		);
		const text = result.response.text().trim();
		return { ok: text.toUpperCase().includes("OK"), text, model };
	}

	/**
	 * Parse un CV depuis des images de pages (vision).
	 * safeParse → retry 1× avec les erreurs de validation dans le prompt.
	 */
	async parseCvFromImages(
		images: CvImportImageInput[],
		options: { model?: string } = {},
	): Promise<CvImportDraft> {
		if (!images.length) {
			throw new ValidationError("At least one CV page image is required");
		}

		const generativeModel = this.jsonModel(options.model ?? DEFAULT_MODEL);

		const imageParts: Array<{
			inlineData: { mimeType: string; data: string };
		}> = [];

		for (const image of images) {
			if (!image.base64?.trim()) {
				throw new ValidationError("Image base64 is empty");
			}
			imageParts.push({
				inlineData: {
					mimeType: image.mimeType,
					data: image.base64,
				},
			});
		}

		let lastReason = "Unknown validation error";

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const prompt = buildCvImportSystemPrompt(
				attempt === 0 ? undefined : { validationErrors: lastReason },
			);

			const result = await generativeModel.generateContent([
				{ text: prompt },
				...imageParts,
			]);
			const outcome = parseJsonWithSchema(
				result.response.text(),
				cvImportDraftSchema,
			);

			if (outcome.ok) return outcome.data;
			lastReason = outcome.reason;
		}

		throw new ValidationError(
			`CV import draft validation failed after retry: ${lastReason}`,
		);
	}

	/**
	 * Relecture générale d’un CV (texte aplati).
	 * safeParse → retry 1× avec les erreurs de validation dans le prompt.
	 */
	async reviewCv(
		cvText: string,
		options: { model?: string } = {},
	): Promise<CvReview> {
		const text = cvText.trim();
		if (!text) {
			throw new ValidationError("CV text is empty");
		}

		const generativeModel = this.jsonModel(options.model ?? DEFAULT_MODEL);
		let lastReason = "Unknown validation error";

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const prompt = buildCvReviewSystemPrompt({
				cvText: text,
				...(attempt === 0
					? {}
					: { validationErrors: lastReason }),
			});

			const result = await generativeModel.generateContent(prompt);
			const outcome = parseJsonWithSchema(
				result.response.text(),
				cvReviewSchema,
			);

			if (outcome.ok) return outcome.data;
			lastReason = outcome.reason;
		}

		throw new ValidationError(
			`CV review validation failed after retry: ${lastReason}`,
		);
	}
}

export const geminiService = new GeminiService();
