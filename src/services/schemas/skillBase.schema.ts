import z from "zod";

export const createSkillBaseSchema = z.object({
	name: z.string().min(1),
});

export const updateSkillBaseSchema = createSkillBaseSchema.partial();

export type CreateSkillBaseInput = z.infer<typeof createSkillBaseSchema>;
export type UpdateSkillBaseInput = z.infer<typeof updateSkillBaseSchema>;
