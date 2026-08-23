import z from "zod";
import { LevelSchema } from "./enums";
import { expertiseContentSchema } from "./cvTemplate.schema";

export const createExpertiseSchema = z.object({
	title: z.string().min(1),
	level: LevelSchema,
	order: z.number().optional(),
	settings: expertiseContentSchema.optional(),
});

export const updateExpertiseSchema = createExpertiseSchema.partial();

export type CreateExpertiseInput = z.infer<typeof createExpertiseSchema>;
export type UpdateExpertiseInput = z.infer<typeof updateExpertiseSchema>;
