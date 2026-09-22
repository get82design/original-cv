import { z } from "zod";
import { LevelSchema } from "./enums";

/**
 * Dates renvoyées par l’IA : ISO date, mois (YYYY-MM) ou année (YYYY).
 * On garde string côté import — conversion Date au mapping profil.
 */
export const cvImportDateSchema = z
	.string()
	.trim()
	.regex(/^(\d{4}(-\d{2}(-\d{2})?)?)$/, "Expected YYYY, YYYY-MM or YYYY-MM-DD")
	.or(z.literal(""))
	.nullish();

const importIdentitySchema = z.object({
	firstName: z.string().trim().min(1).nullish(),
	lastName: z.string().trim().min(1).nullish(),
	email: z.string().trim().email().nullish().or(z.literal("")),
	phone: z.string().trim().nullish(),
	location: z.string().trim().nullish(),
	title: z.string().trim().nullish(),
});

const importMissionSchema = z.object({
	content: z.string().trim().min(1),
});

const importExperienceSchema = z.object({
	title: z.string().trim().min(1),
	company: z.string().trim().nullish(),
	location: z.string().trim().nullish(),
	description: z.string().trim().nullish(),
	start: cvImportDateSchema,
	end: cvImportDateSchema,
	missions: z.array(importMissionSchema).default([]),
});

const importEducationSchema = z.object({
	title: z.string().trim().min(1),
	school: z.string().trim().nullish(),
	degree: z.string().trim().nullish(),
	city: z.string().trim().nullish(),
	start: cvImportDateSchema,
	end: cvImportDateSchema,
});

const importFormationSchema = z.object({
	title: z.string().trim().min(1),
	organismeFormation: z.string().trim().nullish(),
	start: cvImportDateSchema,
	end: cvImportDateSchema,
});

const importLanguageSchema = z.object({
	name: z.string().trim().min(1),
	level: LevelSchema.nullish().or(z.string().trim().nullish()),
});

const importCertificationSchema = z.object({
	title: z.string().trim().min(1),
	organismeCertification: z.string().trim().nullish(),
});

const importSocialMediaSchema = z.object({
	network: z.string().trim().nullish(),
	url: z.string().trim().nullish(),
	username: z.string().trim().nullish(),
});

/**
 * Brouillon d’import CV (sortie Gemini vision).
 * Plus souple que profileSave — pas de clientKey / order / settings.
 */
export const cvImportDraftSchema = z.object({
	identity: importIdentitySchema.default({}),
	description: z.string().trim().nullish(),
	experiences: z.array(importExperienceSchema).default([]),
	educations: z.array(importEducationSchema).default([]),
	formations: z.array(importFormationSchema).default([]),
	languages: z.array(importLanguageSchema).default([]),
	skills: z.array(z.string().trim().min(1)).default([]),
	certifications: z.array(importCertificationSchema).default([]),
	socialMedias: z.array(importSocialMediaSchema).default([]),
	warnings: z.array(z.string().trim().min(1)).default([]),
});

export type CvImportDraft = z.infer<typeof cvImportDraftSchema>;

/** JSON Schema dérivé de Zod (contrat pour le prompt / l’IA). */
export const cvImportDraftJsonSchema = z.toJSONSchema(cvImportDraftSchema, {
	unrepresentable: "any",
	io: "input",
});

const PROMPT_RULES = `Règles :
- Ne invente pas de faits absents des images.
- Dates au format YYYY, YYYY-MM ou YYYY-MM-DD.
- Missions = puces / responsabilités sous une expérience.
- skills = compétences techniques ou soft skills listées.
- Si une info est illisible ou ambiguë, mets-la dans warnings plutôt que d'inventer.
- Tableaux vides [] si la section est absente.
- Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de commentaire).`;

/** Prompt système généré à partir du JSON Schema dérivé de cvImportDraftSchema. */
export function buildCvImportSystemPrompt(options?: { validationErrors?: string }): string {
	const schemaBlock = JSON.stringify(cvImportDraftJsonSchema, null, 2);
	const correction = options?.validationErrors
		? `\n\nLa réponse précédente était invalide. Corrige uniquement selon ces erreurs de validation :\n${options.validationErrors}\nRenvoie le JSON complet corrigé.`
		: "";

	return `Tu extrais le contenu d'un CV à partir d'images de pages.
Réponds avec un unique objet JSON conforme à ce JSON Schema :

${schemaBlock}

${PROMPT_RULES}${correction}`;
}
