import z from "zod";
import { createTagSchema } from "./tag.schema";
import { tagContentSchema } from "./cvTemplate.schema";

export const createTagGroupSchema = z.object({
	title: z.string().min(1),
	order: z.number().min(1),
	tags: z.array(createTagSchema),
	settings: tagContentSchema.optional(),
});

export const updateTagGroupSchema = createTagGroupSchema.partial();

export type CreateTagGroupInput = z.infer<typeof createTagGroupSchema>;
export type UpdateTagGroupInput = z.infer<typeof updateTagGroupSchema>;
