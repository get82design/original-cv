import z from "zod";

export const createMissionSchema = z.object({
	content: z.string().min(1),
	order: z.number().int().min(1),
});

export const updateMissionSchema = createMissionSchema.partial();

export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>;
