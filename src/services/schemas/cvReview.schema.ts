import { z } from "zod";

/**
 * Sortie structurée d’une relecture générale IA du CV.
 * Objectif V0 : tester la pertinence des réponses (pas encore d’apply auto).
 */
export const cvReviewPrioritySchema = z.enum(["haute", "moyenne", "basse"]);

export const cvReviewImprovementSchema = z.object({
	/** Zone concernée : expériences, description, compétences… */
	area: z.string().trim().min(1),
	priority: cvReviewPrioritySchema.nullish(),
	suggestion: z.string().trim().min(1),
});

export const cvReviewSchema = z.object({
	/** Synthèse en 2–4 phrases */
	summary: z.string().trim().min(1),
	/** Note globale /10 — optionnelle si l’IA est incertaine */
	score: z.number().min(0).max(10).nullish(),
	strengths: z.array(z.string().trim().min(1)).default([]),
	improvements: z.array(cvReviewImprovementSchema).default([]),
	/** Petites actions concrètes et rapides */
	quickWins: z.array(z.string().trim().min(1)).default([]),
});

export type CvReview = z.infer<typeof cvReviewSchema>;
export type CvReviewImprovement = z.infer<typeof cvReviewImprovementSchema>;

/** JSON Schema dérivé de Zod (contrat pour le prompt). */
export const cvReviewJsonSchema = z.toJSONSchema(cvReviewSchema, {
	unrepresentable: "any",
	io: "input",
});

const PROMPT_RULES = `Règles :
- Tu es un coach CV francophone, direct et bienveillant.
- Base-toi UNIQUEMENT sur le contenu fourni (ne invente pas d’expériences).
- Sois concret : chaque suggestion doit être actionnable.
- strengths : 2 à 5 points max.
- improvements : 3 à 8 items, priorisés si possible.
- quickWins : 2 à 5 actions faciles (formulation, ordre, mots-clés…).
- score : entier ou décimal /10, ou null si trop peu d’infos.
- Niveaux (languages / skills / expertise) : ce sont des notes UI sans texte affiché. Ne commente PAS ces niveaux, ne suggère PAS de les changer, ne perds pas de temps dessus — ignore-les dans ton analyse.
- Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de commentaire).`;

/**
 * Prompt système pour la relecture — schema JSON dérivé de Zod.
 * @param cvText contenu textuel aplati du CV (header + sections).
 */
export function buildCvReviewSystemPrompt(options: {
	cvText: string;
	validationErrors?: string;
}): string {
	const schemaBlock = JSON.stringify(cvReviewJsonSchema, null, 2);
	const correction = options.validationErrors
		? `\n\nLa réponse précédente était invalide. Corrige uniquement selon ces erreurs :\n${options.validationErrors}\nRenvoie le JSON complet corrigé.`
		: "";

	return `Tu analyses un CV et produis une relecture structurée.
Réponds avec un unique objet JSON conforme à ce JSON Schema :

${schemaBlock}

${PROMPT_RULES}

--- Contenu du CV ---
${options.cvText}
--- Fin du CV ---${correction}`;
}
