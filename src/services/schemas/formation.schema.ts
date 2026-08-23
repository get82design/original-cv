import z from "zod";
import { formationContentSchema } from "./cvTemplate.schema";
import { CvTimelineStatusSchema } from "./enums";

export const createFormationSchema = z.object({
	title: z.string().min(1),
	organismeFormation: z.string().optional(),
	start: z.date(),
	end: z.date().optional(),
	status: CvTimelineStatusSchema.optional().nullable(),
	order: z.number(),
	settings: formationContentSchema.optional(),
});

export const updateFormationSchema = createFormationSchema.partial();

export type CreateFormationInput = z.infer<typeof createFormationSchema>;
export type UpdateFormationInput = z.infer<typeof updateFormationSchema>;
