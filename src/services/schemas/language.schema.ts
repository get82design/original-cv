import z from "zod";
import { Level } from "../../../generated/prisma/client";
import { languageContentSchema } from "./cvTemplate.schema";

export const createLanguageSchema = z.object({
	name: z.string(),
	level: z.nativeEnum(Level),
	order: z.number().optional(),	
	settings: languageContentSchema.optional(),
});

export const updateLanguageSchema = createLanguageSchema.partial();

export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
