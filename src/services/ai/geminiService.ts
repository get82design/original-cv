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
import {
	buildCvRewriteSectionSystemPrompt,
	cvRewriteSectionSchema,
	type CvRewriteSection,
	type CvRewriteSectionType,
} from "../schemas/cvRewriteSection.schema";
import {
	buildCoverLetterSystemPrompt,
	cvCoverLetterSchema,
	type CvCoverLetter,
} from "../schemas/cvCoverLetter.schema";
import {
	buildMatchJobSystemPrompt,
	cvMatchJobSchema,
	type CvMatchJob,
} from "../schemas/cvMatchJob.schema";
import {
	buildMatchRomeFicheSystemPrompt,
	cvMatchRomeFicheSchema,
	type CvMatchRomeFiche,
} from "../schemas/cvMatchRomeFiche.schema";
import { ValidationError, TooManyRequestsError } from "../errors";

const DEFAULT_MODEL = "gemini-3.6-flash";
/** Retry Zod / JSON invalide (re-prompt avec les erreurs). */
const MAX_ATTEMPTS = 2; // 1 appel + 1 retry
/** Retry HTTP transitoires (503 / 429 / overload) avant d’abandonner. */
const TRANSIENT_MAX_ATTEMPTS = 3; // 1 appel + 2 retries
const TRANSIENT_BASE_DELAY_MS = 500;

export type CvImportImageInput = {
	mimeType: "image/png" | "image/jpeg" | "image/webp";
	/** Base64 sans préfixe data: */
	base64: string;
};

function getApiKey() {
	const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!key) {
		throw new ValidationError("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
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

function formatZodIssues(issues: { path: PropertyKey[]; message: string }[]): string {
	return issues
		.slice(0, 8)
		.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
		.join("\n");
}

type ParseOutcome<T> = { ok: true; data: T } | { ok: false; reason: string };

function parseJsonWithSchema<T>(raw: string, schema: z.ZodType<T>): ParseOutcome<T> {
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

function sleep(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

/** Erreurs Gemini souvent intermittentes (capacité / rate limit). */
export function isTransientGeminiError(err: unknown): boolean {
	if (err == null || typeof err !== "object") return false;
	const e = err as {
		status?: number;
		statusCode?: number;
		code?: number | string;
		message?: string;
	};
	const status = e.status ?? e.statusCode;
	if (status === 429 || status === 503 || status === 500) return true;
	if (e.code === 429 || e.code === 503 || e.code === "UNAVAILABLE") return true;

	const msg = (e.message ?? "").toLowerCase();
	return (
		msg.includes("503") ||
		msg.includes("429") ||
		msg.includes("unavailable") ||
		msg.includes("overloaded") ||
		msg.includes("resource exhausted") ||
		msg.includes("high demand") ||
		msg.includes("try again later")
	);
}

export async function withTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
	let lastError: unknown;
	for (let attempt = 0; attempt < TRANSIENT_MAX_ATTEMPTS; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err;
			const canRetry = isTransientGeminiError(err) && attempt < TRANSIENT_MAX_ATTEMPTS - 1;
			if (!canRetry) {
				if (isTransientGeminiError(err)) {
					throw new TooManyRequestsError(undefined, err);
				}
				throw err;
			}
			// Vitest : pas d’attente réelle pour garder les tests rapides
			const delayMs = process.env.VITEST ? 0 : TRANSIENT_BASE_DELAY_MS * 2 ** attempt;
			await sleep(delayMs);
		}
	}
	if (isTransientGeminiError(lastError)) {
		throw new TooManyRequestsError(undefined, lastError);
	}
	throw lastError;
}

export class GeminiService {
	private client() {
		return new GoogleGenerativeAI(getApiKey());
	}

	private jsonModel(model: string, temperature = 0.2) {
		return this.client().getGenerativeModel({
			model,
			generationConfig: {
				responseMimeType: "application/json",
				temperature,
			},
		});
	}

	/** Ping minimal — valide la clé API. */
	async ping(model = DEFAULT_MODEL) {
		const generativeModel = this.client().getGenerativeModel({ model });
		const result = await withTransientRetry(() =>
			generativeModel.generateContent("Réponds uniquement par le mot OK"),
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

			const result = await withTransientRetry(() =>
				generativeModel.generateContent([{ text: prompt }, ...imageParts]),
			);
			const outcome = parseJsonWithSchema(result.response.text(), cvImportDraftSchema);

			if (outcome.ok) return outcome.data;
			lastReason = outcome.reason;
		}

		throw new ValidationError(`CV import draft validation failed after retry: ${lastReason}`);
	}

	/**
	 * Relecture générale d’un CV (texte aplati).
	 * safeParse → retry 1× avec les erreurs de validation dans le prompt.
	 */
	async reviewCv(cvText: string, options: { model?: string } = {}): Promise<CvReview> {
		const text = cvText.trim();
		if (!text) {
			throw new ValidationError("CV text is empty");
		}

		const generativeModel = this.jsonModel(options.model ?? DEFAULT_MODEL);
		let lastReason = "Unknown validation error";

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const prompt = buildCvReviewSystemPrompt({
				cvText: text,
				...(attempt === 0 ? {} : { validationErrors: lastReason }),
			});

			const result = await withTransientRetry(() => generativeModel.generateContent(prompt));
			const outcome = parseJsonWithSchema(result.response.text(), cvReviewSchema);

			if (outcome.ok) return outcome.data;
			lastReason = outcome.reason;
		}

		throw new ValidationError(`CV review validation failed after retry: ${lastReason}`);
	}

	/**
	 * Reformule une section de CV (texte source + type).
	 * safeParse → retry 1× avec les erreurs de validation dans le prompt.
	 */
	async rewriteSection(
		input: {
			sectionType: CvRewriteSectionType;
			sectionLabel: string;
			sourceText: string;
		},
		options: { model?: string } = {},
	): Promise<CvRewriteSection> {
		const sourceText = input.sourceText.trim();
		if (!sourceText) {
			throw new ValidationError("Section source text is empty");
		}

		const generativeModel = this.jsonModel(options.model ?? DEFAULT_MODEL, 0.35);
		let lastReason = "Unknown validation error";

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const prompt = buildCvRewriteSectionSystemPrompt({
				sectionType: input.sectionType,
				sectionLabel: input.sectionLabel,
				sourceText,
				...(attempt === 0 ? {} : { validationErrors: lastReason }),
			});

			const result = await withTransientRetry(() => generativeModel.generateContent(prompt));
			const outcome = parseJsonWithSchema(result.response.text(), cvRewriteSectionSchema);

			if (outcome.ok) return outcome.data;
			lastReason = outcome.reason;
		}

		throw new ValidationError(`CV rewrite validation failed after retry: ${lastReason}`);
	}

	/**
	 * Lettre de motivation à partir du CV (+ ciblage optionnel).
	 * safeParse → retry 1× avec les erreurs de validation dans le prompt.
	 */
	async coverLetter(
		input: {
			cvText: string;
			companyName?: string;
			jobTitle?: string;
			jobOffer?: string;
		},
		options: { model?: string } = {},
	): Promise<CvCoverLetter> {
		const cvText = input.cvText.trim();
		if (!cvText) {
			throw new ValidationError("CV text is empty");
		}

		const companyName = input.companyName?.trim() || undefined;
		const jobTitle = input.jobTitle?.trim() || undefined;
		const jobOffer = input.jobOffer?.trim() || undefined;

		const generativeModel = this.jsonModel(options.model ?? DEFAULT_MODEL, 0.4);
		let lastReason = "Unknown validation error";

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const prompt = buildCoverLetterSystemPrompt({
				cvText,
				...(companyName ? { companyName } : {}),
				...(jobTitle ? { jobTitle } : {}),
				...(jobOffer ? { jobOffer } : {}),
				...(attempt === 0 ? {} : { validationErrors: lastReason }),
			});

			const result = await withTransientRetry(() => generativeModel.generateContent(prompt));
			const outcome = parseJsonWithSchema(result.response.text(), cvCoverLetterSchema);

			if (outcome.ok) return outcome.data;
			lastReason = outcome.reason;
		}

		throw new ValidationError(`Cover letter validation failed after retry: ${lastReason}`);
	}

	/**
	 * Comparaison CV ↔ annonce (match-job).
	 * safeParse → retry 1× avec les erreurs de validation dans le prompt.
	 */
	async matchJob(
		input: {
			cvText: string;
			jobOffer: string;
			companyName?: string;
			jobTitle?: string;
		},
		options: { model?: string } = {},
	): Promise<CvMatchJob> {
		const cvText = input.cvText.trim();
		if (!cvText) {
			throw new ValidationError("CV text is empty");
		}
		const jobOffer = input.jobOffer.trim();
		if (!jobOffer) {
			throw new ValidationError("Job offer text is empty");
		}

		const companyName = input.companyName?.trim() || undefined;
		const jobTitle = input.jobTitle?.trim() || undefined;

		const generativeModel = this.jsonModel(options.model ?? DEFAULT_MODEL);
		let lastReason = "Unknown validation error";

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const prompt = buildMatchJobSystemPrompt({
				cvText,
				jobOffer,
				...(companyName ? { companyName } : {}),
				...(jobTitle ? { jobTitle } : {}),
				...(attempt === 0 ? {} : { validationErrors: lastReason }),
			});

			const result = await withTransientRetry(() => generativeModel.generateContent(prompt));
			const outcome = parseJsonWithSchema(result.response.text(), cvMatchJobSchema);

			if (outcome.ok) return outcome.data;
			lastReason = outcome.reason;
		}

		throw new ValidationError(`Match job validation failed after retry: ${lastReason}`);
	}

	/**
	 * Comparaison CV ↔ fiche métier ROME.
	 * safeParse → retry 1× avec les erreurs de validation dans le prompt.
	 */
	async matchRomeFiche(
		input: {
			cvText: string;
			ficheText: string;
			codeRome?: string;
			libelleRome?: string;
		},
		options: { model?: string } = {},
	): Promise<CvMatchRomeFiche> {
		const cvText = input.cvText.trim();
		if (!cvText) {
			throw new ValidationError("CV text is empty");
		}
		const ficheText = input.ficheText.trim();
		if (!ficheText) {
			throw new ValidationError("Fiche métier text is empty");
		}

		const codeRome = input.codeRome?.trim() || undefined;
		const libelleRome = input.libelleRome?.trim() || undefined;

		const generativeModel = this.jsonModel(options.model ?? DEFAULT_MODEL);
		let lastReason = "Unknown validation error";

		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const prompt = buildMatchRomeFicheSystemPrompt({
				cvText,
				ficheText,
				...(codeRome ? { codeRome } : {}),
				...(libelleRome ? { libelleRome } : {}),
				...(attempt === 0 ? {} : { validationErrors: lastReason }),
			});

			const result = await withTransientRetry(() => generativeModel.generateContent(prompt));
			const outcome = parseJsonWithSchema(result.response.text(), cvMatchRomeFicheSchema);

			if (outcome.ok) return outcome.data;
			lastReason = outcome.reason;
		}

		throw new ValidationError(`Match ROME fiche validation failed after retry: ${lastReason}`);
	}
}

export const geminiService = new GeminiService();
