import z from "zod";

export const philosophySettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createPhilosophySchema = z.object({
	citation: z.string().min(1),
	author: z.string().optional(),
	settings: philosophySettingsSchema.optional(),
});
export const updatePhilosophySchema = createPhilosophySchema.partial();
export type CreatePhilosophyInput = z.infer<typeof createPhilosophySchema>;
export type UpdatePhilosophyInput = z.infer<typeof updatePhilosophySchema>;
