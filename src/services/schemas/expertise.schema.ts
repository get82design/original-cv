import z from "zod";
import { Level } from "../../../generated/prisma/enums";

export const expertiseSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createExpertiseSchema = z.object({
	title: z.string().min(1),
	level: z.nativeEnum(Level),
	order: z.number().optional(),
	settings: expertiseSettingsSchema.optional(),
});

export const updateExpertiseSchema = createExpertiseSchema.partial();

export type CreateExpertiseInput = z.infer<typeof createExpertiseSchema>;
export type UpdateExpertiseInput = z.infer<typeof updateExpertiseSchema>;
