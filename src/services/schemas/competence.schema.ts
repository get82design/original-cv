import z from "zod";

export const createCompetenceSchema = z.object({
	competenceId: z.string().min(1),
	order: z.number().min(1),
});

export const competenceInCvFormSchema = z.object({
	name: z.string().default(""),
	competenceId: z.preprocess(
		(v) => (v === "" || v == null ? undefined : v),
		z.string().min(1).optional(),
	),
});

export const updateCompetenceSchema = createCompetenceSchema.partial();

export type CreateCompetenceInput = z.infer<typeof createCompetenceSchema>;
export type UpdateCompetenceInput = z.infer<typeof updateCompetenceSchema>;
