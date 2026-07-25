import z from "zod";

export const certificationSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createCertificationSchema = z.object({
	title: z.string().min(1),
	organismeCertification: z.string(),
	order: z.number().int().min(1).optional(),
	settings: certificationSettingsSchema.optional(),
});

export const updateCertificationSchema = createCertificationSchema.partial();

export type CreateCertificationInput = z.infer<
	typeof createCertificationSchema
>;
export type UpdateCertificationInput = z.infer<
	typeof updateCertificationSchema
>;
