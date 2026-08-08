import z from "zod";
import { socialMediaContentSchema } from "./cvTemplate.schema";

export const createSocialMediaSchema = z.object({
	socialNetwork: z.string().optional(),
	username: z.string(),
	icon: z.string(),
	order: z.number().optional(),
	settings: socialMediaContentSchema.optional(),
});

export const updateSocialMediaSchema = createSocialMediaSchema.partial();

export type CreateSocialMediaInput = z.infer<typeof createSocialMediaSchema>;
export type UpdateSocialMediaInput = z.infer<typeof updateSocialMediaSchema>;
