import z from "zod";
import { statContentSchema } from "./cvTemplate.schema";

export const createStatSchema = z.object({
	label: z.string().min(1),
	value: z.string().min(1),
	order: z.number(),
	settings: statContentSchema.optional(),
});

export const updateStatSchema = createStatSchema.partial();

export type CreateStatInput = z.infer<typeof createStatSchema>;
export type UpdateStatInput = z.infer<typeof updateStatSchema>;
