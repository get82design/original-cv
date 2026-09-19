import { describe, expect, it } from "vitest";
import {
	buildCvRewriteSectionSystemPrompt,
	cvRewriteSectionJsonSchema,
	cvRewriteSectionSchema,
} from "../../../src/services/schemas/cvRewriteSection.schema";

describe("cvRewriteSectionSchema", () => {
	it("accepts a description-style rewrite", () => {
		const parsed = cvRewriteSectionSchema.parse({
			rationale: "Ton plus direct.",
			rewrittenText: "Développeur full-stack orienté produit.",
			items: [],
		});
		expect(parsed.rewrittenText).toContain("full-stack");
		expect(parsed.items).toEqual([]);
	});

	it("accepts experience items with bullets", () => {
		const parsed = cvRewriteSectionSchema.parse({
			rationale: "Missions plus actionnables.",
			items: [
				{
					id: "exp-1",
					title: "Développeur",
					body: "Refonte du tunnel de commande.",
					bullets: ["Réduit le temps de checkout de 20 %"],
				},
			],
		});
		expect(parsed.items).toHaveLength(1);
		expect(parsed.items[0]?.bullets).toHaveLength(1);
	});

	it("rejects missing rationale", () => {
		const result = cvRewriteSectionSchema.safeParse({
			rewrittenText: "x",
		});
		expect(result.success).toBe(false);
	});

	it("builds a prompt with section hint and source", () => {
		expect(cvRewriteSectionJsonSchema).toMatchObject({ type: "object" });
		const prompt = buildCvRewriteSectionSystemPrompt({
			sectionType: "experience",
			sectionLabel: "Expériences",
			sourceText: "Dev chez Acme — missions floues",
		});
		expect(prompt).toContain("experience");
		expect(prompt).toContain("Expériences");
		expect(prompt).toContain("Dev chez Acme");
		expect(prompt).toContain("items[]");
		expect(prompt).toContain("pas un simple polish cosmétique");
	});
});
