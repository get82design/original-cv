import z from "zod";
import { CVModuleType } from "../../../generated/prisma/enums";
import type { Prisma } from "../../../generated/prisma/client";

/** JSON libre pour les perso UI (fontSize, color, align, show, …) */
export const cvModuleSettingsSchema = z.record(
	z.string(),
	z.any(),
) as z.ZodType<Prisma.InputJsonValue>;

export const createCvModuleSchema = z.object({
	title: z.string().optional(),
	type: z.nativeEnum(CVModuleType),
	order: z.number().int().min(1),
	settings: cvModuleSettingsSchema.optional().default({}),
	isActive: z.boolean().default(true),
});

export const updateCvModuleSchema = createCvModuleSchema.partial();

export type CreateCvModuleInput = z.infer<typeof createCvModuleSchema>;
export type UpdateCvModuleInput = z.infer<typeof updateCvModuleSchema>;
