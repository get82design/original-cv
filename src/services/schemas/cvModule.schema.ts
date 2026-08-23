import z from "zod";
import { CVModuleTypeSchema } from "./enums";

/** JSON libre pour les perso UI (fontSize, color, align, show, …) */
type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };
export const cvModuleSettingsSchema = z.record(
	z.string(),
	z.any(),
) as z.ZodType<JsonValue>;
export type JsonValueType = z.infer<typeof cvModuleSettingsSchema>;

export const createCvModuleSchema = z.object({
	column: z.number().int().min(0).default(0),
	title: z.string().optional(),
	type: CVModuleTypeSchema,
	order: z.number().int().min(1),
	settings: cvModuleSettingsSchema.optional().default({}),
	isActive: z.boolean().default(true),
});

export const updateCvModuleSchema = createCvModuleSchema.partial();

export type CreateCvModuleInput = z.infer<typeof createCvModuleSchema>;
export type UpdateCvModuleInput = z.infer<typeof updateCvModuleSchema>;
