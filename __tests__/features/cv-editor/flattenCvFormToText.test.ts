import { describe, expect, it } from "vitest";
import { flattenCvFormToText } from "../../../src/features/cv-editor/utils/flattenCvFormToText";
import type { CvFormValues } from "../../../src/services/schemas/cvSave.schema";
import { formCvDefaultValue } from "../../../src/features/cv-editor/component/form/defaultValue";

describe("flattenCvFormToText", () => {
	it("returns empty string for an empty form", () => {
		expect(flattenCvFormToText(formCvDefaultValue)).toBe("");
	});

	it("flattens identity, experience and skills", () => {
		const cv = {
			...formCvDefaultValue,
			title: "CV Ada",
			datas: {
				header: {
					prenom: "Ada",
					nom: "Lovelace",
					title: "Mathématicienne",
					subtitle: "",
					email: "ada@example.com",
					phone: "",
					location: "Londres",
					portfolio: "",
				},
				experience: {
					title: "Expériences",
					content: [
						{
							clientKey: "e1",
							order: 1,
							content: {
								title: "Analyste",
								company: "Analytical Engine",
								start: new Date("1842-01-01"),
								end: null,
								missions: [
									{
										clientKey: "m1",
										order: 1,
										content: { content: "Algorithmes" },
									},
								],
							},
						},
					],
				},
				skillGroup: {
					title: "Compétences",
					content: [
						{
							clientKey: "g1",
							order: 1,
							content: {
								title: "Tech",
								skills: [
									{
										clientKey: "s1",
										order: 1,
										content: {
											name: "Math",
											level: "Expert",
										},
									},
								],
							},
						},
					],
				},
			},
		} as CvFormValues;

		const text = flattenCvFormToText(cv);
		expect(text).toContain("Ada");
		expect(text).toContain("Analyste");
		expect(text).toContain("Algorithmes");
		expect(text).toContain("Math");
		expect(text).toContain("## Expériences");
	});
});
