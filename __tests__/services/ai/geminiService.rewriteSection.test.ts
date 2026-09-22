import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: class {
		getGenerativeModel() {
			return { generateContent };
		}
	},
}));

const validRewriteJson = JSON.stringify({
	rationale: "Missions plus concrètes.",
	items: [
		{
			id: "exp-1",
			title: "Développeur",
			body: "Refonte du parcours d’achat.",
			bullets: ["Réduit le checkout de 20 %"],
		},
	],
});

describe("geminiService.rewriteSection", () => {
	beforeEach(() => {
		vi.resetModules();
		generateContent.mockReset();
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
	});

	it("parses and validates a rewrite from Gemini JSON", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => validRewriteJson },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const result = await geminiService.rewriteSection({
			sectionType: "experience",
			sectionLabel: "Expériences",
			sourceText: "id=exp-1\nDev chez Acme\n- faire des trucs",
		});

		expect(result.rationale).toContain("Missions");
		expect(result.items[0]?.id).toBe("exp-1");
		expect(result.items[0]?.bullets).toHaveLength(1);
		expect(generateContent).toHaveBeenCalledOnce();

		const prompt = generateContent.mock.calls[0]![0] as string;
		expect(prompt).toContain("experience");
		expect(prompt).toContain("Dev chez Acme");
	});

	it("retries once when safeParse fails, then succeeds", async () => {
		generateContent
			.mockResolvedValueOnce({
				response: { text: () => JSON.stringify({ items: [] }) },
			})
			.mockResolvedValueOnce({
				response: { text: () => validRewriteJson },
			});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const result = await geminiService.rewriteSection({
			sectionType: "description",
			sectionLabel: "Profil",
			sourceText: "Dev motivé",
		});

		expect(result.items[0]?.title).toBe("Développeur");
		expect(generateContent).toHaveBeenCalledTimes(2);
		const retryPrompt = generateContent.mock.calls[1]![0] as string;
		expect(retryPrompt).toContain("La réponse précédente était invalide");
	});

	it("rejects empty source text", async () => {
		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(
			geminiService.rewriteSection({
				sectionType: "description",
				sectionLabel: "Profil",
				sourceText: "   ",
			}),
		).rejects.toBeInstanceOf(ValidationError);
	});

	it("rejects after retry if still invalid", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => "not-json" },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(
			geminiService.rewriteSection({
				sectionType: "project",
				sectionLabel: "Projets",
				sourceText: "Mon projet",
			}),
		).rejects.toBeInstanceOf(ValidationError);
		expect(generateContent).toHaveBeenCalledTimes(2);
	});
});
