import z from "zod";
import { templateHeaderSettingsSchema } from "./cvTemplate.schema";
import { DrivingLicenseSchema } from "./enums";

export const createCvHeaderSchema = z.object({
	title: z.string(),
	subtitle: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().optional(),
	location: z.string().optional(),
	portfolio: z.string().optional(),
	nom: z.string().optional(),
	prenom: z.string().optional(),
	settings: templateHeaderSettingsSchema.optional(),
	drivingLicenses: z.array(DrivingLicenseSchema).optional().default([]),
	hasVehicle: z.boolean().optional().default(false),
});
export const updateCvHeaderSchema = createCvHeaderSchema.partial();
export type CreateCvHeaderInput = z.infer<typeof createCvHeaderSchema>;
export type UpdateCvHeaderInput = z.infer<typeof updateCvHeaderSchema>;
