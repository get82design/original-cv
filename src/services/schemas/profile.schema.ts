import { z } from "zod";
export const createProfileSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string().optional(),
	location: z.string().optional(),
});
export const updateProfileSchema = createProfileSchema.partial();
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
