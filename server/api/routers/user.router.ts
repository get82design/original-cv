import { userService } from "../../../src/services/user/userService";
import { updateUserSchema } from "../../../src/services/schemas/user.schema";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import {
	forgotPasswordSchema,
	registerSchema,
	resetPasswordSchema,
} from "../../../src/services/schemas/auth.schema";
import { z } from "zod";

const consumeDownloadMetaSchema = z
	.object({
		cvId: z.string().min(1).optional(),
		templateId: z.string().min(1).optional(),
		primaryColorName: z.string().trim().min(1).max(64).optional(),
	})
	.optional();

export const userRouter = router({
	me: protectedProcedure.query(({ ctx }) => userService.findById(ctx.session.user.id)),

	updateProfile: protectedProcedure
		.input(updateUserSchema)
		.mutation(({ input, ctx }) => userService.updateProfile(ctx.session.user.id, input)),

	/** Statut free/paid pour la modal de téléchargement */
	getDownloadStatus: protectedProcedure.query(({ ctx }) =>
		userService.getDownloadStatus(ctx.session.user.id),
	),

	/** Export gratuit (avec logo) */
	consumeFreeDownload: protectedProcedure
		.input(consumeDownloadMetaSchema)
		.mutation(({ ctx, input }) => userService.consumeFreeDownload(ctx.session.user.id, input)),

	/** Export payant (sans logo) */
	consumePaidDownload: protectedProcedure
		.input(consumeDownloadMetaSchema)
		.mutation(({ ctx, input }) => userService.consumePaidDownload(ctx.session.user.id, input)),

	/** @deprecated alias de consumePaidDownload — garder pour compat */
	consumeDownloadCredit: protectedProcedure.mutation(({ ctx }) =>
		userService.consumeDownloadCredit(ctx.session.user.id),
	),

	incrementIaRequests: protectedProcedure.mutation(({ ctx }) =>
		userService.incrementIaRequests(ctx.session.user.id),
	),

	canCreateCv: protectedProcedure.query(({ ctx }) => userService.canCreateCv(ctx.session.user.id)),

	countUserCvs: protectedProcedure.query(({ ctx }) =>
		userService.countUserCvs(ctx.session.user.id),
	),

	register: publicProcedure
		.input(registerSchema)
		.mutation(({ input }) =>
			userService.register({
				email: input.email,
				password: input.password,
				name: input.name ?? "",
			}),
		),

	forgotPassword: publicProcedure
		.input(forgotPasswordSchema)
		.mutation(({ input }) => userService.requestPasswordReset(input.email)),

	resetPassword: publicProcedure
		.input(resetPasswordSchema)
		.mutation(({ input }) =>
			userService.resetPassword({ token: input.token, password: input.password }),
		),
});

//! Retiré volontairement (à faire plus tard avec un adminProcedure / webhook) :

// all, byId, byEmail
// resetIaRequests, updateMaxCvs, updatePlan
// grantFreeDownload, grantPaidDownloadCredits — appelés côté service (pas exposés : abus)
