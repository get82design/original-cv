import z from "zod";

export const prizeSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createPrizeSchema = z.object({
	title: z.string().min(1),
	domaine: z.string().min(1),
	order: z.number().optional(),
	settings: prizeSettingsSchema.optional(),
});
export const updatePrizeSchema = createPrizeSchema.partial();

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;
export type UpdatePrizeInput = z.infer<typeof updatePrizeSchema>;
