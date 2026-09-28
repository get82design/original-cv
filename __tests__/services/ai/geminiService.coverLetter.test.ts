import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: class {
		getGenerativeModel() {
			return { generateContent };
		}
	},
}));

const validLetterJson = JSON.stringify({
	letter:
		"Madame, Monsieur,\n\nFort de mon expérience en analyse de données, je souhaite rejoindre votre équipe.\n\nCordialement,\nAda Lovelace",
	subject: "Candidature — Analyste de données",
});

describe("geminiService.coverLetter", () => {
	beforeEach(() => {
		vi.resetModules();
		generateContent.mockReset();
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
	});

	it("parses and validates a cover letter from Gemini JSON", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => validLetterJson },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const result = await geminiService.coverLetter({
			cvText: "Ada Lovelace — Analyste chez Analytical Engine",
			companyName: "Acme",
			jobTitle: "Data Analyst",
		});

		expect(result.subject).toContain("Candidature");
		expect(result.letter).toContain("analyse de données");
		expect(generateContent).toHaveBeenCalledOnce();

		const prompt = generateContent.mock.calls[0]![0] as string;
		expect(prompt).toContain("Ada Lovelace");
		expect(prompt).toContain("Acme");
		expect(prompt).toContain("Data Analyst");
		expect(prompt).toContain("letter");
	});

	it("works without optional targeting fields", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => validLetterJson },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		await geminiService.coverLetter({ cvText: "CV minimal" });

		const prompt = generateContent.mock.calls[0]![0] as string;
		expect(prompt).toContain("Aucun ciblage fourni");
	});

	it("retries once when safeParse fails, then succeeds", async () => {
		generateContent
			.mockResolvedValueOnce({
				response: { text: () => JSON.stringify({ subject: "x" }) },
			})
			.mockResolvedValueOnce({
				response: { text: () => validLetterJson },
			});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const result = await geminiService.coverLetter({ cvText: "CV minimal" });
		expect(result.letter).toContain("Madame");
		expect(generateContent).toHaveBeenCalledTimes(2);

		const retryPrompt = generateContent.mock.calls[1]![0] as string;
		expect(retryPrompt).toContain("La réponse précédente était invalide");
	});

	it("rejects empty CV text", async () => {
		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(geminiService.coverLetter({ cvText: "   " })).rejects.toBeInstanceOf(
			ValidationError,
		);
	});

	it("rejects after retry if still invalid", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => "not-json" },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(
			geminiService.coverLetter({ cvText: "Un CV quelconque" }),
		).rejects.toBeInstanceOf(ValidationError);
		expect(generateContent).toHaveBeenCalledTimes(2);
	});
});
