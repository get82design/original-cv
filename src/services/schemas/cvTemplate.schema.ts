import z from "zod";

export const templateStructureSchema = z.object({
	sections: z.array(z.string().min(1)),
});

export const templateDefaultStylesSchema = z.object({
	color: z.string().min(1),
	// tu pourras enrichir plus tard :
	// fontSize: z.number().optional(),
	// align: z.enum(["left", "center", "right"]).optional(),
});

export const createCvTemplateSchema = z.object({
	name: z.string().min(1),
	structure: templateStructureSchema,
	defaultStyles: templateDefaultStylesSchema, // comme dans Prisma / ton DTO actuel
});

export const updateCvTemplateSchema = createCvTemplateSchema.partial();

export type CreateCvTemplateInput = z.infer<typeof createCvTemplateSchema>;
export type UpdateCvTemplateInput = z.infer<typeof updateCvTemplateSchema>;
