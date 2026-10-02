import { z } from "zod";
import {
	cvMatchJobJsonSchema,
	cvMatchJobSchema,
	type CvMatchJob,
} from "./cvMatchJob.schema";

/**
 * Sortie comparaison CV ↔ fiche ROME — même contrat que match-job.
 */
export const cvMatchRomeFicheSchema = cvMatchJobSchema;
export type CvMatchRomeFiche = CvMatchJob;

const PROMPT_RULES = `Règles :
- Tu es un coach emploi francophone, direct et bienveillant.
- Base-toi UNIQUEMENT sur le CV et la fiche métier ROME fournis — n’invente AUCUN fait, diplôme, employeur ou compétence absents du CV.
- Compare concrètement les compétences / savoirs / attendus de la fiche aux preuves du CV.
- matched : 2 à 6 points max (ce qui colle vraiment).
- gaps : 2 à 8 items, priorisés si possible — suggestions actionnables (reformuler, ajouter un mot-clé déjà justifié par le parcours, réordonner…).
- keywordsToAdd : 2 à 6 formulations / mots-clés tirés de la fiche et pertinents pour ce CV (pas de jargon inventé).
- score : entier ou décimal /10 (adéquation), ou null si trop peu d’infos.
- Niveaux (languages / skills / expertise) : notes UI sans texte affiché — ignore-les.
- Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de commentaire).`;

/**
 * Prompt système pour le match CV ↔ fiche ROME.
 */
export function buildMatchRomeFicheSystemPrompt(options: {
	cvText: string;
	ficheText: string;
	codeRome?: string;
	libelleRome?: string;
	validationErrors?: string;
}): string {
	const schemaBlock = JSON.stringify(cvMatchJobJsonSchema, null, 2);
	const correction = options.validationErrors
		? `\n\nLa réponse précédente était invalide. Corrige uniquement selon ces erreurs :\n${options.validationErrors}\nRenvoie le JSON complet corrigé.`
		: "";

	const headerParts: string[] = [];
	if (options.codeRome?.trim()) headerParts.push(`Code ROME : ${options.codeRome.trim()}`);
	if (options.libelleRome?.trim()) headerParts.push(`Libellé : ${options.libelleRome.trim()}`);
	const header =
		headerParts.length > 0 ? `${headerParts.join(" · ")}\n\n` : "";

	return `Tu compares un CV à une fiche métier du référentiel ROME (France Travail) et produis une analyse d’adéquation structurée.
Réponds avec un unique objet JSON conforme à ce JSON Schema :

${schemaBlock}

${PROMPT_RULES}

--- Contenu du CV ---
${options.cvText}
--- Fin du CV ---

--- Fiche métier ROME ---
${header}${options.ficheText.trim()}
--- Fin de la fiche ---${correction}`;
}

// Ré-export utile pour les tests Zod isolés
export { z };
