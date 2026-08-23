import z from "zod";
import { passionContentSchema } from "./cvTemplate.schema";

export const createPassionInputSchema = z.object({
	title: z.string().min(1),
	icon: z.string().min(1),
	order: z.number().optional(),
	settings: passionContentSchema.optional(),
});
export const updatePassionInputSchema = createPassionInputSchema.partial();

export type CreatePassionInput = z.infer<typeof createPassionInputSchema>;
export type UpdatePassionInput = z.infer<typeof updatePassionInputSchema>;
