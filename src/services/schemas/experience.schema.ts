import z from "zod";

export const createMissionExperienceSchema = z.object({
	content: z.string().min(1),
	order: z.number(),
});

export const experienceSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createExperienceSchema = z.object({
	title: z.string().min(1),
	company: z.string().min(1),
	description: z.string().optional(),
	start: z.date(),
	end: z.date().optional(),
	location: z.string().optional(),
	missions: z.array(createMissionExperienceSchema),
	order: z.number(),
	settings: experienceSettingsSchema.optional(),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
