import z from "zod";

export const socialMediaSettingsSchema = z.record(z.string(), z.boolean()).optional();

export const createSocialMediaSchema = z.object({
	socialNetwork: z.string(),
	username: z.string(),
	order: z.number().optional(),
	settings: socialMediaSettingsSchema.optional(),
});

export const updateSocialMediaSchema = createSocialMediaSchema.partial();

export type CreateSocialMediaInput = z.infer<typeof createSocialMediaSchema>;
export type UpdateSocialMediaInput = z.infer<typeof updateSocialMediaSchema>;
