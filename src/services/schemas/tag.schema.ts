import z from "zod";

export const createTagSchema = z.object({
	tagId: z.string().min(1),
	order: z.number().min(1),
});

export const tagInCvFormSchema = z.object({
	name: z.string(),
	tagId: z.string().min(1).optional(),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
