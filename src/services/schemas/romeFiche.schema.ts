import { z } from "zod";

/** Code ROME fonctionnel (lettre + 4 chiffres), ex. M1805. */
export const romeCodeSchema = z
	.string()
	.trim()
	.regex(/^[A-Za-z]\d{4}$/, "Code ROME invalide");

export const romeMetierRefSchema = z
	.object({
		code: z.string(),
		libelle: z.string().optional(),
		riasecMineur: z.string().optional(),
		riasecMajeur: z.string().optional(),
	})
	.passthrough();

/** Hit autocomplete appellation/requete. */
export const romeAppellationSearchHitSchema = z
	.object({
		code: z.string(),
		libelle: z.string(),
		classification: z.string().optional(),
		emploiCadre: z.boolean().optional(),
		emploiReglemente: z.boolean().optional(),
		transitionEcologique: z.boolean().optional(),
		transitionNumerique: z.boolean().optional(),
		transitionDemographique: z.boolean().optional(),
		transitionEcologiqueDetaillee: z.string().nullish(),
		metier: romeMetierRefSchema,
		appellationEsco: z
			.object({
				libelle: z.string().optional(),
				uri: z.string().optional(),
			})
			.passthrough()
			.optional(),
		secondaire: z.string().optional(),
	})
	.passthrough();

export const romeAppellationSearchResponseSchema = z
	.object({
		totalResultats: z.number().int().nonnegative().optional(),
		requete: z.string().optional(),
		resultats: z.array(romeAppellationSearchHitSchema).default([]),
	})
	.passthrough();

export type RomeAppellationSearchHit = z.infer<typeof romeAppellationSearchHitSchema>;
export type RomeAppellationSearchResponse = z.infer<typeof romeAppellationSearchResponseSchema>;

/** Résultat search exposé à l’UI / tRPC ( aplati ). */
export const romeAppellationHitDtoSchema = z.object({
	appellationCode: z.string(),
	appellationLibelle: z.string(),
	codeRome: z.string(),
	libelleRome: z.string(),
	classification: z.string().optional(),
});

export type RomeAppellationHitDto = z.infer<typeof romeAppellationHitDtoSchema>;

/** Payload brut API Métiers — permissif. */
export const romeMetierRawSchema = z
	.object({
		code: z.string().optional(),
		libelle: z.string().optional(),
		definition: z.string().optional(),
		acces: z.string().optional(),
		accesEmploi: z.string().optional(),
		accesMetier: z.string().optional(),
	})
	.passthrough();

export type RomeMetierRaw = z.infer<typeof romeMetierRawSchema>;

const romeFicheItemSchema = z
	.object({
		code: z.string().optional(),
		libelle: z.string().optional(),
	})
	.passthrough();

/** Payload brut API Fiches métiers — structure groupée. */
export const romeFicheRawSchema = z
	.object({
		code: z.string().optional(),
		metier: romeMetierRefSchema.optional(),
		groupesCompetencesMobilisees: z
			.array(
				z
					.object({
						enjeu: z
							.object({ libelle: z.string().optional() })
							.passthrough()
							.optional(),
						competences: z.array(romeFicheItemSchema).optional(),
					})
					.passthrough(),
			)
			.optional(),
		groupesSavoirs: z
			.array(
				z
					.object({
						categorieSavoirs: z
							.object({ libelle: z.string().optional() })
							.passthrough()
							.optional(),
						savoirs: z.array(romeFicheItemSchema).optional(),
					})
					.passthrough(),
			)
			.optional(),
	})
	.passthrough();

export type RomeFicheRaw = z.infer<typeof romeFicheRawSchema>;

export const romeCompetenceDtoSchema = z.object({
	code: z.string().optional(),
	libelle: z.string(),
	groupe: z.string().optional(),
});

export const romeSavoirDtoSchema = z.object({
	code: z.string().optional(),
	libelle: z.string(),
	categorie: z.string().optional(),
});

/** DTO produit pour UI + prompt IA. */
export const romeFicheDtoSchema = z.object({
	codeRome: z.string(),
	libelle: z.string(),
	definition: z.string().optional(),
	accesMetier: z.string().optional(),
	competences: z.array(romeCompetenceDtoSchema).default([]),
	savoirs: z.array(romeSavoirDtoSchema).default([]),
});

export type RomeCompetenceDto = z.infer<typeof romeCompetenceDtoSchema>;
export type RomeSavoirDto = z.infer<typeof romeSavoirDtoSchema>;
export type RomeFicheDto = z.infer<typeof romeFicheDtoSchema>;

export function mapSearchHitToDto(hit: RomeAppellationSearchHit): RomeAppellationHitDto | null {
	const codeRome = hit.metier?.code?.trim();
	if (!codeRome) return null;
	return {
		appellationCode: hit.code,
		appellationLibelle: hit.libelle,
		codeRome: codeRome.toUpperCase(),
		libelleRome: hit.metier.libelle?.trim() || codeRome.toUpperCase(),
		...(hit.classification ? { classification: hit.classification } : {}),
	};
}

/**
 * Fusionne les réponses Métiers + Fiches en DTO produit.
 */
export function mapRomeApisToFicheDto(
	metier: RomeMetierRaw,
	fiche: RomeFicheRaw,
	codeRome: string,
): RomeFicheDto {
	const normalizedCode = codeRome.toUpperCase();
	const libelle =
		metier.libelle?.trim() ||
		fiche.metier?.libelle?.trim() ||
		normalizedCode;

	const accesMetier =
		metier.accesMetier?.trim() ||
		metier.acces?.trim() ||
		metier.accesEmploi?.trim() ||
		undefined;

	const competences: RomeCompetenceDto[] = [];
	for (const groupe of fiche.groupesCompetencesMobilisees ?? []) {
		const groupeLabel = groupe.enjeu?.libelle?.trim();
		for (const c of groupe.competences ?? []) {
			const lib = c.libelle?.trim();
			if (!lib) continue;
			competences.push({
				libelle: lib,
				...(c.code ? { code: c.code } : {}),
				...(groupeLabel ? { groupe: groupeLabel } : {}),
			});
		}
	}

	const savoirs: RomeSavoirDto[] = [];
	for (const groupe of fiche.groupesSavoirs ?? []) {
		const categorie = groupe.categorieSavoirs?.libelle?.trim();
		for (const s of groupe.savoirs ?? []) {
			const lib = s.libelle?.trim();
			if (!lib) continue;
			savoirs.push({
				libelle: lib,
				...(s.code ? { code: s.code } : {}),
				...(categorie ? { categorie } : {}),
			});
		}
	}

	return {
		codeRome: (metier.code ?? fiche.metier?.code ?? normalizedCode).toUpperCase(),
		libelle,
		...(metier.definition?.trim() ? { definition: metier.definition.trim() } : {}),
		...(accesMetier ? { accesMetier } : {}),
		competences,
		savoirs,
	};
}

/** Texte aplati pour le prompt IA. */
export function formatRomeFicheForPrompt(fiche: RomeFicheDto): string {
	const parts: string[] = [
		`Métier ROME ${fiche.codeRome} — ${fiche.libelle}`,
	];
	if (fiche.definition) parts.push(`Définition :\n${fiche.definition}`);
	if (fiche.accesMetier) parts.push(`Accès au métier :\n${fiche.accesMetier}`);
	if (fiche.competences.length) {
		parts.push(
			`Compétences :\n${fiche.competences.map((c) => `- ${c.libelle}`).join("\n")}`,
		);
	}
	if (fiche.savoirs.length) {
		parts.push(`Savoirs :\n${fiche.savoirs.map((s) => `- ${s.libelle}`).join("\n")}`);
	}
	return parts.join("\n\n");
}
