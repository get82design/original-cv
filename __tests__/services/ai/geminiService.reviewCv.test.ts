import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: class {
		getGenerativeModel() {
			return { generateContent };
		}
	},
}));

const validReviewJson = JSON.stringify({
	summary: "CV clair avec une expérience pertinente.",
	score: 7,
	strengths: ["Parcours cohérent"],
	improvements: [
		{
			area: "description",
			priority: "haute",
			suggestion: "Ajouter des résultats chiffrés.",
		},
	],
	quickWins: ["Préciser le titre"],
});

describe("geminiService.reviewCv", () => {
	beforeEach(() => {
		vi.resetModules();
		generateContent.mockReset();
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
	});

	it("parses and validates a review from Gemini JSON", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => validReviewJson },
		});

		const { geminiService } = await import(
			"../../../src/services/ai/geminiService"
		);

		const review = await geminiService.reviewCv(
			"Ada Lovelace — Analyste chez Analytical Engine",
		);

		expect(review.score).toBe(7);
		expect(review.strengths).toEqual(["Parcours cohérent"]);
		expect(review.improvements[0]?.suggestion).toContain("chiffrés");
		expect(generateContent).toHaveBeenCalledOnce();

		const prompt = generateContent.mock.calls[0]![0] as string;
		expect(prompt).toContain("Ada Lovelace");
		expect(prompt).toContain("improvements");
	});

	it("retries once when safeParse fails, then succeeds", async () => {
		generateContent
			.mockResolvedValueOnce({
				response: { text: () => JSON.stringify({ score: 5 }) },
			})
			.mockResolvedValueOnce({
				response: { text: () => validReviewJson },
			});

		const { geminiService } = await import(
			"../../../src/services/ai/geminiService"
		);

		const review = await geminiService.reviewCv("CV minimal");
		expect(review.summary).toContain("clair");
		expect(generateContent).toHaveBeenCalledTimes(2);

		const retryPrompt = generateContent.mock.calls[1]![0] as string;
		expect(retryPrompt).toContain("La réponse précédente était invalide");
	});

	it("rejects empty CV text", async () => {
		const { geminiService } = await import(
			"../../../src/services/ai/geminiService"
		);
		const { ValidationError } = await import(
			"../../../src/services/errors"
		);

		await expect(geminiService.reviewCv("   ")).rejects.toBeInstanceOf(
			ValidationError,
		);
	});

	it("rejects after retry if still invalid", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => "not-json" },
		});

		const { geminiService } = await import(
			"../../../src/services/ai/geminiService"
		);
		const { ValidationError } = await import(
			"../../../src/services/errors"
		);

		await expect(
			geminiService.reviewCv("Un CV quelconque"),
		).rejects.toBeInstanceOf(ValidationError);
		expect(generateContent).toHaveBeenCalledTimes(2);
	});

	it("retries on transient 503 then succeeds", async () => {
		const overloaded = Object.assign(
			new Error("[503 Service Unavailable] The model is overloaded"),
			{ status: 503 },
		);
		generateContent
			.mockRejectedValueOnce(overloaded)
			.mockResolvedValueOnce({
				response: { text: () => validReviewJson },
			});

		const { geminiService } = await import(
			"../../../src/services/ai/geminiService"
		);

		const review = await geminiService.reviewCv("CV minimal");
		expect(review.score).toBe(7);
		expect(generateContent).toHaveBeenCalledTimes(2);
	});

	it("does not retry non-transient errors", async () => {
		const badKey = Object.assign(new Error("[401 Unauthorized]"), {
			status: 401,
		});
		generateContent.mockRejectedValueOnce(badKey);

		const { geminiService } = await import(
			"../../../src/services/ai/geminiService"
		);

		await expect(geminiService.reviewCv("CV")).rejects.toThrow(
			"401 Unauthorized",
		);
		expect(generateContent).toHaveBeenCalledOnce();
	});
});
