import { describe, expect, it } from "vitest";
import { applyCvRewriteToForm } from "../../../src/features/cv-editor/utils/applyCvRewriteToForm";
import type { CvFormValues } from "../../../src/services/schemas/cvSave.schema";
import { formCvDefaultValue } from "../../../src/features/cv-editor/component/form/defaultValue";

describe("applyCvRewriteToForm", () => {
	const base = {
		...formCvDefaultValue,
		datas: {
			description: {
				title: "Profil",
				content: { description: "Ancien texte." },
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

	it("applique rewrittenText sur la description", () => {
		const next = applyCvRewriteToForm(base, "description", {
			rationale: "Plus clair",
			rewrittenText: "Nouveau profil percutant.",
			items: [],
		});
		expect(next.datas?.description?.content?.description).toBe(
			"Nouveau profil percutant.",
		);
		expect(base.datas?.description?.content?.description).toBe(
			"Ancien texte.",
		);
	});

	it("met à jour une expérience via id clientKey", () => {
		const next = applyCvRewriteToForm(base, "experience", {
			rationale: "Missions plus impactantes",
			rewrittenText: null,
			items: [
				{
					id: "exp-1",
					title: "Développeur full-stack",
					body: "Backend et APIs",
					bullets: ["APIs REST", "CI/CD"],
				},
			],
		});
		const exp = next.datas?.experience?.content?.[0];
		expect(exp?.clientKey).toBe("exp-1");
		expect(exp?.content.title).toBe("Développeur full-stack");
		expect(exp?.content.description).toBe("Backend et APIs");
		expect(exp?.content.missions?.map((m) => m.content.content)).toEqual([
			"APIs REST",
			"CI/CD",
		]);
		expect(exp?.content.missions?.[0]?.clientKey).toBe("m1");
	});
});
