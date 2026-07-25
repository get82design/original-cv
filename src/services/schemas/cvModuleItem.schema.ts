import z from "zod";
import { CVModuleItemType } from "../../../generated/prisma/enums";

export const cvModuleItemSchema = z.object({
	itemType: z.nativeEnum(CVModuleItemType),
	itemId: z.string(),
	order: z.number(),
});

export type CvModuleItemInput = z.infer<typeof cvModuleItemSchema>;