import z from "zod";

export const createMissionVolunteeringSchema = z.object({
	content: z.string().min(1),
	order: z.number().int().min(1),
});

export const volunteeringSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createVolunteeringSchema = z.object({
	title: z.string().min(1),
	organisation: z.string().min(1),
	description: z.string().optional(),
	start: z.date(),
	end: z.date().optional(),
	location: z.string().optional(),
	missions: z.array(createMissionVolunteeringSchema),
	order: z.number().int().min(1),
	settings: volunteeringSettingsSchema.optional(),
});

export const updateVolunteeringSchema = createVolunteeringSchema.partial();

export type CreateVolunteeringInput = z.infer<typeof createVolunteeringSchema>;
export type UpdateVolunteeringInput = z.infer<typeof updateVolunteeringSchema>;
