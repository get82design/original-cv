import z from "zod";
import { languageContentSchema } from "./cvTemplate.schema";
import { LevelSchema } from "./enums";

export const createLanguageSchema = z.object({
	name: z.string(),
	level: LevelSchema,
	order: z.number().optional(),
	settings: languageContentSchema.optional(),
});

export const updateLanguageSchema = createLanguageSchema.partial();

export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
