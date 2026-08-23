import z from "zod";
import { strengthContentSchema } from "./cvTemplate.schema";

export const createStrengthSchema = z.object({
	title: z.string().min(1),
	icon: z.string().optional(),
	description: z.string().optional(),
	order: z.number(),
	settings: strengthContentSchema.optional(),
});

export const updateStrengthSchema = createStrengthSchema.partial();

export type CreateStrengthInput = z.infer<typeof createStrengthSchema>;
export type UpdateStrengthInput = z.infer<typeof updateStrengthSchema>;
