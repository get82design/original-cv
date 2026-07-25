import z from "zod";
import { createCompetenceSchema } from "./competence.schema";

export const competenceGroupSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createCompetenceGroupSchema = z.object({
	title: z.string().min(1),
	order: z.number().min(1),
	competences: z.array(createCompetenceSchema),
	settings: competenceGroupSettingsSchema.optional(),
});

export const updateCompetenceGroupSchema =
	createCompetenceGroupSchema.partial();

export type CreateCompetenceGroupInput = z.infer<
	typeof createCompetenceGroupSchema
>;
export type UpdateCompetenceGroupInput = z.infer<
	typeof updateCompetenceGroupSchema
>;
