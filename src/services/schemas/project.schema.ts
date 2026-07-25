import z from "zod";
import { CvTimelineStatus } from "../../../generated/prisma/enums";

export const createMissionProjectSchema = z.object({
	content: z.string().min(1),
	order: z.number().int().min(1),
});

export const projectSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createProjectSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	location: z.string().optional(),
	start: z.date(),
	end: z.date().optional(),
	technology: z.string().optional(),
	order: z.number().int().min(1),
	missions: z.array(createMissionProjectSchema).optional(),
	status: z.nativeEnum(CvTimelineStatus).optional(),
	settings: projectSettingsSchema.optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
