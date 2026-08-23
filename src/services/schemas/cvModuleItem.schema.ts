import z from "zod";
import { CVModuleItemTypeSchema } from "./enums";

export const cvModuleItemSchema = z.object({
	itemType: CVModuleItemTypeSchema,
	itemId: z.string(),
	order: z.number(),
});

export type CvModuleItemInput = z.infer<typeof cvModuleItemSchema>;
