import { z } from "zod";

/**
 * Sortie structurée d’une comparaison CV ↔ annonce (match-job).
 * Lecture seule — pas d’apply auto au CV.
 */
export const cvMatchJobPrioritySchema = z.enum(["haute", "moyenne", "basse"]);

export const cvMatchJobGapSchema = z.object({
	/** Zone concernée : expériences, compétences, mots-clés… */
	area: z.string().trim().min(1),
	priority: cvMatchJobPrioritySchema.nullish(),
	suggestion: z.string().trim().min(1),
});

export const cvMatchJobSchema = z.object({
	/** Synthèse en 2–4 phrases sur l’adéquation */
	summary: z.string().trim().min(1),
	/** Note d’adéquation /10 — optionnelle si trop peu d’infos */
	score: z.number().min(0).max(10).nullish(),
	/** Points du CV qui collent à l’annonce */
	matched: z.array(z.string().trim().min(1)).default([]),
	/** Écarts / manques par rapport à l’offre */
	gaps: z.array(cvMatchJobGapSchema).default([]),
	/** Mots-clés / formulations à ajouter ou renforcer */
	keywordsToAdd: z.array(z.string().trim().min(1)).default([]),
});

export type CvMatchJob = z.infer<typeof cvMatchJobSchema>;
export type CvMatchJobGap = z.infer<typeof cvMatchJobGapSchema>;

/** JSON Schema dérivé de Zod (contrat pour le prompt). */
export const cvMatchJobJsonSchema = z.toJSONSchema(cvMatchJobSchema, {
	unrepresentable: "any",
	io: "input",
});

const PROMPT_RULES = `Règles :
- Tu es un coach emploi francophone, direct et bienveillant.
- Base-toi UNIQUEMENT sur le CV et l’annonce fournis — ne invente AUCUN fait, diplôme, employeur ou compétence absents du CV.
- Compare concrètement les exigences de l’annonce aux preuves du CV.
- matched : 2 à 6 points max (ce qui colle vraiment).
- gaps : 2 à 8 items, priorisés si possible — suggestions actionnables (reformuler, ajouter un mot-clé déjà justifié par le parcours, réordonner…).
- keywordsToAdd : 2 à 6 formulations / mots-clés tirés de l’annonce et pertinents pour ce CV (pas de jargon inventé).
- score : entier ou décimal /10 (adéquation), ou null si trop peu d’infos.
- Niveaux (languages / skills / expertise) : notes UI sans texte affiché — ignore-les.
- Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de commentaire).`;

/**
 * Prompt système pour le match CV ↔ annonce — schema JSON dérivé de Zod.
 */
export function buildMatchJobSystemPrompt(options: {
	cvText: string;
	jobOffer: string;
	companyName?: string;
	jobTitle?: string;
	validationErrors?: string;
}): string {
	const schemaBlock = JSON.stringify(cvMatchJobJsonSchema, null, 2);
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
	targetingParts.push(`Annonce :\n${options.jobOffer.trim()}`);
	const targetingBlock = `--- Offre d’emploi ---\n${targetingParts.join("\n\n")}\n--- Fin de l’offre ---`;

	return `Tu compares un CV à une offre d’emploi et produis une analyse d’adéquation structurée.
Réponds avec un unique objet JSON conforme à ce JSON Schema :

${schemaBlock}

${PROMPT_RULES}

--- Contenu du CV ---
${options.cvText}
--- Fin du CV ---

${targetingBlock}${correction}`;
}
