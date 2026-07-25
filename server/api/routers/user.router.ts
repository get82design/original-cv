import { userService } from "../../../src/services/user/userService";
import { updateUserSchema } from "../../../src/services/schemas/user.schema";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { registerSchema } from "../../../src/services/schemas/auth.schema";

export const userRouter = router({
	me: protectedProcedure.query(({ ctx }) =>
		userService.findById(ctx.session.user.id),
	),

	updateProfile: protectedProcedure
		.input(updateUserSchema)
		.mutation(({ input, ctx }) =>
			userService.updateProfile(ctx.session.user.id, input),
		),

	consumeDownloadCredit: protectedProcedure.mutation(({ ctx }) =>
		userService.consumeDownloadCredit(ctx.session.user.id),
	),

	incrementIaRequests: protectedProcedure.mutation(({ ctx }) =>
		userService.incrementIaRequests(ctx.session.user.id),
	),

	canCreateCv: protectedProcedure.query(({ ctx }) =>
		userService.canCreateCv(ctx.session.user.id),
	),

	countUserCvs: protectedProcedure.query(({ ctx }) =>
		userService.countUserCvs(ctx.session.user.id),
	),

	register: publicProcedure
	.input(registerSchema)
	.mutation(({ input }) => userService.register({ email: input.email, password: input.password, name: input.name ?? "" })),
});

//! Retiré volontairement (à faire plus tard avec un adminProcedure) :

// all, byId, byEmail
// resetIaRequests, updateMaxCvs, updatePlan
