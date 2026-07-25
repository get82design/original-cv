import z from "zod";

export const createCvHeaderSchema = z.object({
	title: z.string(),
	subtitle: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().optional(),
	location: z.string().optional(),
	portfolio: z.string().optional(),
	nom: z.string().optional(),
	prenom: z.string().optional(),
});
export const updateCvHeaderSchema = createCvHeaderSchema.partial();
export type CreateCvHeaderInput = z.infer<typeof createCvHeaderSchema>;
export type UpdateCvHeaderInput = z.infer<typeof updateCvHeaderSchema>;
