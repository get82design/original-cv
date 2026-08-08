import z from "zod";
import { CvTimelineStatus } from "../../../generated/prisma/enums";
import { educationContentSchema } from "./cvTemplate.schema";

export const createEducationSchema = z.object({
	title: z.string(),
	school: z.string().min(1),
	degree: z.string(),
	start: z.date(),
	end: z.date().optional().nullable(),
	city: z.string().optional(),
	obtained: z.enum(CvTimelineStatus).optional().nullable(),
	order: z.number(),	
	settings: educationContentSchema.optional(),
});

export const updateEducationSchema = createEducationSchema.partial();

export type CreateEducationInput = z.infer<typeof createEducationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;
