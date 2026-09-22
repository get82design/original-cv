import { profileSaveService } from "../../../src/services/profile/profileSaveService";
import { profileService } from "../../../src/services/profile/profileService";
import {
	createProfileSchema,
	updateProfileSchema,
} from "../../../src/services/schemas/profile.schema";
import { profileSaveSchema } from "../../../src/services/schemas/profileSave.schema";
import { protectedProcedure, router } from "../trpc";

export const profileRouter = router({
	create: protectedProcedure
		.input(createProfileSchema)
		.mutation(({ input, ctx }) => profileService.create(ctx.session.user.id, input)),

	me: protectedProcedure.query(({ ctx }) => profileService.findByUserId(ctx.session.user.id)),

	completeMe: protectedProcedure.query(({ ctx }) =>
		profileService.findCompleteByUserId(ctx.session.user.id),
	),

	save: protectedProcedure
		.input(profileSaveSchema)
		.mutation(({ input, ctx }) => profileSaveService.save(ctx.session.user.id, input)),

	update: protectedProcedure
		.input(updateProfileSchema)
		.mutation(({ input, ctx }) => profileService.update(ctx.session.user.id, input)),

	delete: protectedProcedure.mutation(({ ctx }) => profileService.delete(ctx.session.user.id)),
});
