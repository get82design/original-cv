import z from "zod";
import { Level } from "../../../generated/prisma/client";

export const languageSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createLanguageSchema = z.object({
	name: z.string(),
	level: z.nativeEnum(Level),
	order: z.number().optional(),	
	settings: languageSettingsSchema.optional(),
});

export const updateLanguageSchema = createLanguageSchema.partial();

export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
