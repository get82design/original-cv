import z from "zod";

export const createTagSourceSchema = z.object({
	name: z.string().min(1),
});

export const updateTagSourceSchema = createTagSourceSchema.partial();

export type CreateTagSourceInput = z.infer<typeof createTagSourceSchema>;
export type UpdateTagSourceInput = z.infer<typeof updateTagSourceSchema>;
