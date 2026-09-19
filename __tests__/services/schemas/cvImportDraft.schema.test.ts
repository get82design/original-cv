import { describe, expect, it } from "vitest";
import {
	buildCvImportSystemPrompt,
	cvImportDraftJsonSchema,
	cvImportDraftSchema,
} from "../../../src/services/schemas/cvImportDraft.schema";

describe("cvImportDraftSchema", () => {
	it("accepts a minimal valid draft", () => {
		const parsed = cvImportDraftSchema.parse({
			identity: { firstName: "Ada", lastName: "Lovelace" },
			skills: ["Math"],
		});

		expect(parsed.identity.firstName).toBe("Ada");
		expect(parsed.experiences).toEqual([]);
		expect(parsed.warnings).toEqual([]);
	});

	it("accepts experiences with YYYY-MM dates and missions", () => {
		const parsed = cvImportDraftSchema.parse({
			identity: {},
			experiences: [
				{
					title: "Développeuse",
					company: "Analytical Engine",
					start: "1842-01",
					end: null,
					missions: [{ content: "Programmation" }],
				},
			],
		});

		expect(parsed.experiences).toHaveLength(1);
		expect(parsed.experiences[0]?.start).toBe("1842-01");
		expect(parsed.experiences[0]?.missions[0]?.content).toBe("Programmation");
	});

	it("rejects invalid date formats", () => {
		const result = cvImportDraftSchema.safeParse({
			experiences: [
				{
					title: "Dev",
					start: "01/2020",
				},
			],
		});
		expect(result.success).toBe(false);
	});

	it("derives a JSON Schema from Zod", () => {
		expect(cvImportDraftJsonSchema).toMatchObject({ type: "object" });
		expect(cvImportDraftJsonSchema).toHaveProperty("properties.experiences");
		expect(cvImportDraftJsonSchema).toHaveProperty("properties.skills");
	});

	it("builds a system prompt embedding the derived JSON Schema", () => {
		const prompt = buildCvImportSystemPrompt();
		expect(prompt).toContain('"type": "object"');
		expect(prompt).toContain("experiences");
		expect(prompt).toContain("Réponds UNIQUEMENT avec un JSON valide");

		const retryPrompt = buildCvImportSystemPrompt({
			validationErrors: "experiences.0.start: Expected YYYY",
		});
		expect(retryPrompt).toContain("La réponse précédente était invalide");
		expect(retryPrompt).toContain("experiences.0.start: Expected YYYY");
	});
});
