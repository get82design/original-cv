import z from "zod";
import { projectContentSchema } from "./cvTemplate.schema";
import { CvTimelineStatusSchema } from "./enums";

export const createMissionProjectSchema = z.object({
	content: z.string().min(1),
	order: z.number().int().min(1),
});

export const createProjectSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	result: z.string().optional(),
	location: z.string().optional(),
	start: z.date(),
	end: z.date().optional(),
	technology: z.string().optional(),
	order: z.number().int().min(1),
	missions: z.array(createMissionProjectSchema).optional(),
	status: CvTimelineStatusSchema.optional(),
	settings: projectContentSchema.optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
