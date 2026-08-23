import z from "zod";
import { prizeContentSchema } from "./cvTemplate.schema";

export const createPrizeSchema = z.object({
	title: z.string().min(1),
	domaine: z.string(),
	icon: z.string().optional(),
	order: z.number().optional(),
	settings: prizeContentSchema.optional(),
});
export const updatePrizeSchema = createPrizeSchema.partial();

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;
export type UpdatePrizeInput = z.infer<typeof updatePrizeSchema>;
