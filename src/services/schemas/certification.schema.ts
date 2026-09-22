import z from "zod";
import { certificationContentSchema } from "./cvTemplate.schema";

export const createCertificationSchema = z.object({
	title: z.string().min(1),
	organismeCertification: z.string(),
	order: z.number().int().min(1).optional(),
	settings: certificationContentSchema.optional(),
});

export const updateCertificationSchema = createCertificationSchema.partial();

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
