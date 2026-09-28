import { z } from "zod";

/**
 * Sortie structurée d’une lettre de motivation IA.
 * Pas d’apply au CV — le client copie le texte.
 */
export const cvCoverLetterSchema = z.object({
	/** Corps de la lettre (paragraphes, sans markdown). */
	letter: z.string().trim().min(1),
	/** Objet e-mail / titre court — optionnel. */
	subject: z.string().trim().min(1).nullish(),
});

export type CvCoverLetter = z.infer<typeof cvCoverLetterSchema>;

/** JSON Schema dérivé de Zod (contrat pour le prompt). */
export const cvCoverLetterJsonSchema = z.toJSONSchema(cvCoverLetterSchema, {
	unrepresentable: "any",
	io: "input",
});

const PROMPT_RULES = `Règles :
- Tu es un rédacteur RH francophone : clair, professionnel, convaincant sans flatterie excessive.
- Base-toi UNIQUEMENT sur le CV et le ciblage fournis — ne invente AUCUN fait, chiffre, diplôme, employeur ou compétence.
- Structure classique : accroche → motivations / adéquation → preuves tirées du CV → conclusion + disponibilité.
- Ton naturel, « je », 250–450 mots environ (pas de pavé).
- Si aucun ciblage (entreprise / poste / annonce) : lettre générique mais concrète, basée sur le parcours du CV (pas de « Madame, Monsieur » vide).
- Si ciblage partiel : utilise ce qui est fourni ; n’invente pas le reste.
- subject : une ligne d’objet e-mail utile, ou null.
- letter : texte prêt à coller (retours à la ligne OK, pas de markdown, pas de JSON dans letter).
- Ignore les « levels » / notes UI s’ils apparaissent dans le CV.
- Réponds UNIQUEMENT avec un JSON valide (pas de markdown autour).`;

/**
 * Prompt système pour la lettre de motivation — schema JSON dérivé de Zod.
 */
export function buildCoverLetterSystemPrompt(options: {
	cvText: string;
	companyName?: string;
	jobTitle?: string;
	jobOffer?: string;
	validationErrors?: string;
}): string {
	const schemaBlock = JSON.stringify(cvCoverLetterJsonSchema, null, 2);
	const correction = options.validationErrors
		? `\n\nLa réponse précédente était invalide. Corrige uniquement selon ces erreurs :\n${options.validationErrors}\nRenvoie le JSON complet corrigé.`
		: "";

	const targetingParts: string[] = [];
	if (options.companyName?.trim()) {
		targetingParts.push(`Entreprise : ${options.companyName.trim()}`);
	}
	if (options.jobTitle?.trim()) {
		targetingParts.push(`Intitulé du poste : ${options.jobTitle.trim()}`);
	}
	if (options.jobOffer?.trim()) {
		targetingParts.push(`Extrait / annonce :\n${options.jobOffer.trim()}`);
	}
	const targetingBlock =
		targetingParts.length > 0
			? `--- Ciblage (optionnel, fourni par l’utilisateur) ---\n${targetingParts.join("\n\n")}\n--- Fin du ciblage ---`
			: `--- Ciblage ---\nAucun ciblage fourni : lettre générique basée sur le CV.\n--- Fin du ciblage ---`;

	return `Tu rédiges une lettre de motivation en français.
Réponds avec un unique objet JSON conforme à ce JSON Schema :

${schemaBlock}

${PROMPT_RULES}

--- Contenu du CV ---
${options.cvText}
--- Fin du CV ---

${targetingBlock}${correction}`;
}
