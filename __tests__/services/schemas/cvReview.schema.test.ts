import { describe, expect, it } from "vitest";
import {
	buildCvReviewSystemPrompt,
	cvReviewJsonSchema,
	cvReviewSchema,
} from "../../../src/services/schemas/cvReview.schema";

describe("cvReviewSchema", () => {
	it("accepts a minimal valid review", () => {
		const parsed = cvReviewSchema.parse({
			summary: "CV solide avec une expérience claire.",
			score: 7.5,
			strengths: ["Parcours cohérent"],
			improvements: [
				{
					area: "description",
					priority: "haute",
					suggestion: "Ajouter des résultats chiffrés.",
				},
			],
			quickWins: ["Titre plus précis"],
		});

		expect(parsed.score).toBe(7.5);
		expect(parsed.improvements).toHaveLength(1);
	});

	it("defaults empty arrays", () => {
		const parsed = cvReviewSchema.parse({
			summary: "Peu d’éléments à évaluer.",
		});
		expect(parsed.strengths).toEqual([]);
		expect(parsed.improvements).toEqual([]);
		expect(parsed.quickWins).toEqual([]);
	});

	it("rejects missing summary", () => {
		const result = cvReviewSchema.safeParse({ score: 5 });
		expect(result.success).toBe(false);
	});

	it("derives JSON Schema and embeds it in the prompt", () => {
		expect(cvReviewJsonSchema).toMatchObject({ type: "object" });
		const prompt = buildCvReviewSystemPrompt({
			cvText: "Ada Lovelace — Analyste",
		});
		expect(prompt).toContain("Ada Lovelace");
		expect(prompt).toContain('"type": "object"');
		expect(prompt).toContain("improvements");
	});
});
