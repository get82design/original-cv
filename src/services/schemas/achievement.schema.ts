import z from "zod";
import { achievementContentSchema } from "./cvTemplate.schema";

export const createAchievementSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	year: z.number().optional(),
	technology: z.string().optional(),
	order: z.number().min(1),
	settings: achievementContentSchema.optional(),
});

export const updateAchievementSchema = createAchievementSchema.partial();
export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;
