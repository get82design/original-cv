import z from "zod";
import { LevelSchema } from "./enums";

export const createSkillSchema = z.object({
	level: LevelSchema,
	skillId: z.string().min(1),
	order: z.number().min(1),
});

export const updateSkillSchema = createSkillSchema.partial();

export const skillInCvFormSchema = z.object({
	name: z.string(),
	skillId: z.string().min(1).optional(),
	level: LevelSchema,
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
