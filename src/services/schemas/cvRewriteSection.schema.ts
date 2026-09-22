import { z } from "zod";

/**
 * Types de sections reformulables (V0).
 * Un seul prompt + branches légères selon le type.
 */
export const cvRewriteSectionTypeSchema = z.enum([
	"description",
	"experience",
	"project",
	"volunteering",
	"achievement",
]);

export type CvRewriteSectionType = z.infer<typeof cvRewriteSectionTypeSchema>;

export const cvRewriteItemSchema = z.object({
	/** clientKey fourni en entrée si présent — pour réappliquer au bon item */
	id: z.string().trim().nullish(),
	title: z.string().trim().nullish(),
	/** Paragraphe / description reformulé */
	body: z.string().trim().nullish(),
	/** Puces (missions, points clés…) */
	bullets: z.array(z.string().trim().min(1)).default([]),
});

/**
 * Sortie d’une reformulation de section.
 * description → rewrittenText
 * listes (expérience…) → items[]
 */
export const cvRewriteSectionSchema = z.object({
	/** Ce qui a changé, en 1–3 phrases (onglet IA / preview) */
	rationale: z.string().trim().min(1),
	rewrittenText: z.string().trim().nullish(),
	items: z.array(cvRewriteItemSchema).default([]),
});

export type CvRewriteSection = z.infer<typeof cvRewriteSectionSchema>;
export type CvRewriteItem = z.infer<typeof cvRewriteItemSchema>;

export const cvRewriteSectionJsonSchema = z.toJSONSchema(cvRewriteSectionSchema, {
	unrepresentable: "any",
	io: "input",
});

const SECTION_HINTS: Record<CvRewriteSectionType, string> = {
	description:
		"Section profil / accroche : un paragraphe plus percutant et fluide, ton pro, sans inventer de faits. Remplis rewrittenText (items vide).",
	experience:
		"Expériences : reformule titres/descriptions/missions pour plus d’impact. Conserve le sens. Remplis items[] (id = id fourni). Missions → bullets.",
	project: "Projets : title + body (+ bullets si points clés). Ne change pas les techno inventées.",
	volunteering: "Bénévolat : title + body + bullets éventuels. Garde le sens associatif.",
	achievement: "Réalisations : title + body, formulations impactantes mais factuelles.",
};

const PROMPT_RULES = `Règles :
- Tu es un rédacteur CV francophone : clair, concret, professionnel.
- Ne invente AUCUN fait, chiffre, employeur ou techno absent du texte source.
- Propose une vraie reformulation (rythme, clarté, impact recruteur) — pas un simple polish cosmétique.
- Si le texte source est déjà bon, améliore quand même structure et accroche de façon visible.
- Si description → rewrittenText, items = [].
- Si liste (expérience, projet, bénévolat, réalisation) → items[] (reprends les id fournis), rewrittenText = null.
- rationale : 1–3 phrases sur ce que tu as amélioré.
- Ignore les « levels » / notes UI s’ils apparaissent.
- Réponds UNIQUEMENT avec un JSON valide (pas de markdown).`;

/**
 * Prompt unique de reformulation — le type de section affine les consignes.
 */
export function buildCvRewriteSectionSystemPrompt(options: {
	sectionType: CvRewriteSectionType;
	sectionLabel: string;
	sourceText: string;
	validationErrors?: string;
}): string {
	const schemaBlock = JSON.stringify(cvRewriteSectionJsonSchema, null, 2);
	const hint = SECTION_HINTS[options.sectionType];
	const correction = options.validationErrors
		? `\n\nLa réponse précédente était invalide. Corrige uniquement selon ces erreurs :\n${options.validationErrors}\nRenvoie le JSON complet corrigé.`
		: "";

	return `Tu reformules une partie de CV.
Type de section : ${options.sectionType}
Libellé UI : ${options.sectionLabel}
Consigne spécifique : ${hint}

Réponds avec un unique objet JSON conforme à ce JSON Schema :

${schemaBlock}

${PROMPT_RULES}

--- Contenu source à reformuler ---
${options.sourceText}
--- Fin du contenu ---${correction}`;
}
