import { describe, expect, it } from "vitest";
import {
	mapRomeApisToFicheDto,
	mapSearchHitToDto,
	romeAppellationSearchResponseSchema,
	formatRomeFicheForPrompt,
} from "../../../src/services/schemas/romeFiche.schema";

describe("romeFiche.schema", () => {
	it("parse une réponse search appellation", () => {
		const parsed = romeAppellationSearchResponseSchema.parse({
			totalResultats: 1,
			requete: "developpeur",
			resultats: [
				{
					code: "10868",
					libelle: "Développeur / Développeuse informatique",
					metier: { code: "M1805", libelle: "Études et développement informatique" },
				},
			],
		});
		expect(parsed.resultats).toHaveLength(1);
		const dto = mapSearchHitToDto(parsed.resultats[0]!);
		expect(dto?.codeRome).toBe("M1805");
		expect(dto?.appellationLibelle).toContain("Développeur");
	});

	it("merge métier + fiche en DTO produit", () => {
		const dto = mapRomeApisToFicheDto(
			{
				code: "M1805",
				libelle: "Études et développement informatique",
				definition: "Conçoit et développe des applications.",
				acces: "Bac+2 à Bac+5",
			},
			{
				metier: { code: "M1805", libelle: "Études et développement informatique" },
				groupesCompetencesMobilisees: [
					{
						enjeu: { libelle: "Développement" },
						competences: [{ code: "1", libelle: "Développer une application" }],
					},
				],
				groupesSavoirs: [
					{
						categorieSavoirs: { libelle: "Techniques" },
						savoirs: [{ libelle: "Langages de programmation" }],
					},
				],
			},
			"M1805",
		);

		expect(dto.definition).toContain("Conçoit");
		expect(dto.accesMetier).toBe("Bac+2 à Bac+5");
		expect(dto.competences[0]?.libelle).toBe("Développer une application");
		expect(dto.competences[0]?.groupe).toBe("Développement");
		expect(dto.savoirs[0]?.libelle).toContain("Langages");
	});

	it("formatRomeFicheForPrompt inclut les sections utiles", () => {
		const text = formatRomeFicheForPrompt({
			codeRome: "M1805",
			libelle: "Dev",
			definition: "Def",
			competences: [{ libelle: "Coder" }],
			savoirs: [{ libelle: "SQL" }],
		});
		expect(text).toContain("M1805");
		expect(text).toContain("Coder");
		expect(text).toContain("SQL");
	});
});
