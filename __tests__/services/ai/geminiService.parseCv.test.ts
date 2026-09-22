import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: class {
		getGenerativeModel() {
			return { generateContent };
		}
	},
}));

const validDraftJson = JSON.stringify({
	identity: { firstName: "Ada", lastName: "Lovelace" },
	skills: ["Math"],
	experiences: [
		{
			title: "Analyste",
			company: "Analytical Engine",
			start: "1842",
			missions: [{ content: "Algorithmes" }],
		},
	],
});

describe("geminiService.parseCvFromImages", () => {
	beforeEach(() => {
		vi.resetModules();
		generateContent.mockReset();
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
	});

	it("parses and validates Gemini JSON into a draft", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => validDraftJson },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const draft = await geminiService.parseCvFromImages([{ mimeType: "image/png", base64: "aaa" }]);

		expect(draft.identity.firstName).toBe("Ada");
		expect(draft.skills).toEqual(["Math"]);
		expect(draft.experiences[0]?.missions[0]?.content).toBe("Algorithmes");
		expect(generateContent).toHaveBeenCalledOnce();

		const firstCallParts = generateContent.mock.calls[0]![0] as Array<{
			text?: string;
		}>;
		expect(firstCallParts[0]?.text).toContain('"type": "object"');
		expect(firstCallParts[0]?.text).toContain("experiences");
	});

	it("retries once when safeParse fails, then succeeds", async () => {
		generateContent
			.mockResolvedValueOnce({
				response: {
					text: () =>
						JSON.stringify({
							experiences: [{ title: "Dev", start: "01/2020" }],
						}),
				},
			})
			.mockResolvedValueOnce({
				response: { text: () => validDraftJson },
			});

		const { geminiService } = await import("../../../src/services/ai/geminiService");

		const draft = await geminiService.parseCvFromImages([{ mimeType: "image/png", base64: "aaa" }]);

		expect(draft.identity.firstName).toBe("Ada");
		expect(generateContent).toHaveBeenCalledTimes(2);

		const retryParts = generateContent.mock.calls[1]![0] as Array<{
			text?: string;
		}>;
		expect(retryParts[0]?.text).toContain("La réponse précédente était invalide");
	});

	it("rejects empty image list", async () => {
		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(geminiService.parseCvFromImages([])).rejects.toBeInstanceOf(ValidationError);
	});

	it("rejects after retry if still invalid", async () => {
		generateContent.mockResolvedValue({
			response: { text: () => "not-json" },
		});

		const { geminiService } = await import("../../../src/services/ai/geminiService");
		const { ValidationError } = await import("../../../src/services/errors");

		await expect(
			geminiService.parseCvFromImages([{ mimeType: "image/png", base64: "aaa" }]),
		).rejects.toBeInstanceOf(ValidationError);
		expect(generateContent).toHaveBeenCalledTimes(2);
	});
});
