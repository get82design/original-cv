import z from "zod";
import { publicationContentSchema } from "./cvTemplate.schema";

export const createPublicationSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	journalName: z.string().optional(),
	start: z.date(),
	end: z.date().optional(),
	url: z.string().optional(),
	order: z.number().min(1),
	settings: publicationContentSchema.optional(),
});

export const updatePublicationSchema = createPublicationSchema.partial();

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
