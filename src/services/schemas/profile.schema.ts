import { z } from "zod";
import { DrivingLicenseSchema } from "./enums";

export const createProfileSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string().nullish(),
	location: z.string().nullish(),
	email: z.string().email().nullish(),
	photo: z.string().nullish(),
	drivingLicenses: z.array(DrivingLicenseSchema).default([]),
	hasVehicle: z.boolean().default(false),
});
export const updateProfileSchema = createProfileSchema.partial();
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
