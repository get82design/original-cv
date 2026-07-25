import z from "zod";
import { Level } from "../../../generated/prisma/enums";

export const createSkillSchema = z.object({
	level: z.nativeEnum(Level),
	skillId: z.string().min(1),
	order: z.number().min(1),
});

export const updateSkillSchema = createSkillSchema.partial();

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
