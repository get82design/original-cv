import z from "zod";
import { createSkillSchema } from "./skill.schema";
import { skillContentSchema } from "./cvTemplate.schema";

export const createSkillGroupSchema = z.object({
	title: z.string().min(1),
	order: z.number().min(1),
	skills: z.array(createSkillSchema),
	settings: skillContentSchema.optional(),
});

export const updateSkillGroupSchema = createSkillGroupSchema.partial();

export type CreateSkillGroupInput = z.infer<typeof createSkillGroupSchema>;
export type UpdateSkillGroupInput = z.infer<typeof updateSkillGroupSchema>;
