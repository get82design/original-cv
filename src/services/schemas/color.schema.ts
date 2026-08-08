import z from "zod";

export const colorSchema = z.object({
	name: z.string(),
	primary: z.string(),
});
export const updateColorSchema = colorSchema.partial();

// Inputs API (écriture)
export type CreateColorInput = z.infer<typeof colorSchema>;
export type UpdateColorInput = z.infer<typeof updateColorSchema>;

// Outputs API (lecture) → voir utils/trpc.types.ts → type Color