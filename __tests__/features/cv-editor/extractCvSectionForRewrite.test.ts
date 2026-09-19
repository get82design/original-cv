import { describe, expect, it } from "vitest";
import {
	extractCvSectionSourceText,
	listRewriteableSections,
} from "../../../src/features/cv-editor/utils/extractCvSectionForRewrite";
import type { CvFormValues } from "../../../src/services/schemas/cvSave.schema";
import { formCvDefaultValue } from "../../../src/features/cv-editor/component/form/defaultValue";

describe("extractCvSectionForRewrite", () => {
	const cv = {
		...formCvDefaultValue,
		datas: {
			description: {
				title: "Profil",
				content: { description: "Dev orienté produit." },
			},
			experience: {
				title: "Expériences",
				content: [
					{
						clientKey: "exp-1",
						order: 1,
						content: {
							title: "Dev",
							company: "Acme",
							start: new Date("2020-01-01"),
							end: null,
							description: "Backend",
							missions: [
								{
									clientKey: "m1",
									order: 1,
									content: { content: "APIs" },
								},
							],
						},
					},
				],
			},
		},
	} as CvFormValues;

	it("lists only sections with content", () => {
		const list = listRewriteableSections(cv);
		expect(list.map((s) => s.sectionType)).toEqual([
			"description",
			"experience",
		]);
	});

	it("extracts description text", () => {
		const extracted = extractCvSectionSourceText(cv, "description");
		expect(extracted?.sectionLabel).toBe("Profil");
		expect(extracted?.sourceText).toContain("produit");
	});

	it("extracts experiences with clientKey ids", () => {
		const extracted = extractCvSectionSourceText(cv, "experience");
		expect(extracted?.sourceText).toContain("[id=exp-1]");
		expect(extracted?.sourceText).toContain("Acme");
		expect(extracted?.sourceText).toContain("APIs");
	});

	it("returns null when section empty", () => {
		expect(extractCvSectionSourceText(cv, "project")).toBeNull();
	});
});
