import z from "zod";

export const createCompetenceSchema = z.object({
	competenceId: z.string().min(1),
	order: z.number().min(1),
});

export const updateCompetenceSchema = createCompetenceSchema.partial();

export type CreateCompetenceInput = z.infer<typeof createCompetenceSchema>;
export type UpdateCompetenceInput = z.infer<typeof updateCompetenceSchema>;
