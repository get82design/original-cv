import z from "zod";
import { CvTimelineStatus } from "../../../generated/prisma/enums";

export const formationSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createFormationSchema = z.object({
	title: z.string().min(1),
	organismeFormation: z.string().optional(),
	start: z.date(),
	end: z.date().optional(),
	status: z.nativeEnum(CvTimelineStatus).optional().nullable(),
	order: z.number(),
	settings: formationSettingsSchema.optional(),
});

export const updateFormationSchema = createFormationSchema.partial();

export type CreateFormationInput = z.infer<typeof createFormationSchema>;
export type UpdateFormationInput = z.infer<typeof updateFormationSchema>;
