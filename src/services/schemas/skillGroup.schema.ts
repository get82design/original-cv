import z from "zod";
import { createSkillSchema } from "./skill.schema";

export const skillGroupSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createSkillGroupSchema = z.object({
	title: z.string().min(1),
	order: z.number().min(1),
	skills: z.array(createSkillSchema),
	settings: skillGroupSettingsSchema.optional(),
});

export const updateSkillGroupSchema = createSkillGroupSchema.partial();

export type CreateSkillGroupInput = z.infer<typeof createSkillGroupSchema>;
export type UpdateSkillGroupInput = z.infer<typeof updateSkillGroupSchema>;
