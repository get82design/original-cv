import z from "zod";

export const strengthSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createStrengthSchema = z.object({
	title: z.string().min(1),
	icon: z.string().optional(),
	order: z.number(),
	settings: strengthSettingsSchema.optional(),
});

export const updateStrengthSchema = createStrengthSchema.partial();

export type CreateStrengthInput = z.infer<typeof createStrengthSchema>;
export type UpdateStrengthInput = z.infer<typeof updateStrengthSchema>;
