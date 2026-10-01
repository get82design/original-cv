import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: class {
		getGenerativeModel() {
			return { generateContent };
		}
	},
}));

const validMatchJson = JSON.stringify({
	summary: "Bon alignement sur l’analyse de données ; manque l’expérience cloud.",
	score: 7.5,
	matched: ["Expérience analyste", "Maîtrise SQL"],
	gaps: [
		{
			area: "Cloud",
			priority: "haute",
			suggestion: "Mentionne AWS / GCP si tu as des preuves dans le parcours.",
		},
	],
	keywordsToAdd: ["SQL", "dashboard", "stakeholder"],
});

describe("geminiService.matchJob", () => {
	beforeEach(() => {
		vi.resetModules();
		generateContent.mockReset();
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
	});

	it("parses and validates a match result from Gemini JSON", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => validMatchJson },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const result = await geminiService.matchJob({
			cvText: "Ada Lovelace — Analyste chez Analytical Engine",
			jobOffer: "Recherche Data Analyst SQL + cloud",
			companyName: "Acme",
			jobTitle: "Data Analyst",
		});

		expect(result.score).toBe(7.5);
		expect(result.matched).toContain("Expérience analyste");
		expect(result.gaps[0]?.area).toBe("Cloud");
		expect(generateContent).toHaveBeenCalledOnce();

		const prompt = generateContent.mock.calls[0]![0] as string;
		expect(prompt).toContain("Ada Lovelace");
		expect(prompt).toContain("Acme");
		expect(prompt).toContain("Data Analyst");
		expect(prompt).toContain("Recherche Data Analyst");
		expect(prompt).toContain("matched");
	});

	it("requires a non-empty job offer", async () => {
		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(
			geminiService.matchJob({ cvText: "CV minimal", jobOffer: "   " }),
		).rejects.toBeInstanceOf(ValidationError);
	});

	it("retries once when safeParse fails, then succeeds", async () => {
		generateContent
			.mockResolvedValueOnce({
				response: { text: () => JSON.stringify({ score: "not-a-number" }) },
			})
			.mockResolvedValueOnce({
				response: { text: () => validMatchJson },
			});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const result = await geminiService.matchJob({
			cvText: "CV minimal",
			jobOffer: "Offre Data",
		});
		expect(result.summary).toContain("alignement");
		expect(generateContent).toHaveBeenCalledTimes(2);

		const retryPrompt = generateContent.mock.calls[1]![0] as string;
		expect(retryPrompt).toContain("La réponse précédente était invalide");
	});

	it("rejects empty CV text", async () => {
		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(
			geminiService.matchJob({ cvText: "   ", jobOffer: "Offre" }),
		).rejects.toBeInstanceOf(ValidationError);
	});

	it("rejects after retry if still invalid", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => "not-json" },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(
			geminiService.matchJob({ cvText: "Un CV quelconque", jobOffer: "Une offre" }),
		).rejects.toBeInstanceOf(ValidationError);
		expect(generateContent).toHaveBeenCalledTimes(2);
	});
});
