import z from "zod";

    export const colorSchema = z.object({
	name: z.string(),
	primary: z.string(),
});
export const updateColorSchema = colorSchema.partial();

export type CreateColorInput = z.infer<typeof colorSchema>;
export type UpdateColorInput = z.infer<typeof updateColorSchema>;