import z from "zod";

export const colorSchema = z.object({
	name: z.string(),
	primary: z.string(),
});
export const updateColorSchema = colorSchema.partial();

export const moveColorSchema = z.object({
	id: z.string().min(1),
	direction: z.enum(["up", "down"]),
});

// Inputs API (écriture)
export type CreateColorInput = z.infer<typeof colorSchema>;
export type UpdateColorInput = z.infer<typeof updateColorSchema>;
export type MoveColorInput = z.infer<typeof moveColorSchema>;

// Outputs API (lecture) → voir utils/trpc.types.ts → type Color
