import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1).optional(),
	/** Acceptation CGU + politique de confidentialité (obligatoire à l’inscription). */
	acceptTerms: z.literal(true),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email(),
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8),
});
