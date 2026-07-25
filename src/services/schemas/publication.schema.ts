import z from "zod";

export const publicationSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createPublicationSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	journalName: z.string().optional(),
	start: z.date(),
	end: z.date().optional(),
	url: z.string().optional(),
	order: z.number().min(1),
	settings: publicationSettingsSchema.optional(),
});

export const updatePublicationSchema = createPublicationSchema.partial();

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
