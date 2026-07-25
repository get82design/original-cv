import z from "zod";

export const createCvInputSchema = z.object({
	templateId: z.string(),
	title: z.string(),
});
export const updateCvInputSchema = z.object({
	templateId: z.string().optional(),
	title: z.string().optional(),
});
// Types service (avec userId injecté côté router)
export type CreateCvInput = z.infer<typeof createCvInputSchema> & {
	userId: string;
};

export type UpdateCvInput = z.infer<typeof updateCvInputSchema>;
