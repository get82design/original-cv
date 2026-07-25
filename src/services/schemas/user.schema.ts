import z from "zod";

export const userSchema = z.object({
	name: z.string(),
	image: z.string().optional(),
});
export const updateUserSchema = userSchema.partial();
export type CreateUserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
