import z from "zod";

export const createDescriptionSchema = z.object({
	description: z.string(),
});
export const updateDescriptionSchema = createDescriptionSchema.partial();
export type CreateDescriptionInput = z.infer<typeof createDescriptionSchema>;
export type UpdateDescriptionInput = z.infer<typeof updateDescriptionSchema>;
