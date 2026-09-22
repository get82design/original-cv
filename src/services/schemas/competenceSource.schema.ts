import z from "zod";

export const createCompetenceSourceSchema = z.object({
	name: z.string().min(1),
});

export const updateCompetenceSourceSchema = createCompetenceSourceSchema.partial();

export type CreateCompetenceSourceInput = z.infer<typeof createCompetenceSourceSchema>;
export type UpdateCompetenceSourceInput = z.infer<typeof updateCompetenceSourceSchema>;
