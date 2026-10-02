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
	summary: "Bon alignement sur le développement ; manque les savoirs SGBD.",
	score: 7,
	matched: ["Expérience développeur"],
	gaps: [
		{
			area: "Savoirs",
			priority: "moyenne",
			suggestion: "Mentionne les SGBD déjà utilisés en poste.",
		},
	],
	keywordsToAdd: ["application", "besoins client"],
});

describe("geminiService.matchRomeFiche", () => {
	beforeEach(() => {
		vi.resetModules();
		generateContent.mockReset();
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
	});

	it("parses and validates a ROME match result from Gemini JSON", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => validMatchJson },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const result = await geminiService.matchRomeFiche({
			cvText: "Ada — Développeuse",
			ficheText: "Métier ROME M1805 — Dev\nCompétences :\n- Coder",
			codeRome: "M1805",
			libelleRome: "Études et développement informatique",
		});

		expect(result.score).toBe(7);
		expect(result.matched[0]).toContain("développeur");
	});

	it("rejects empty fiche text", async () => {
		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(
			geminiService.matchRomeFiche({ cvText: "CV", ficheText: "   " }),
		).rejects.toBeInstanceOf(ValidationError);
	});
});
