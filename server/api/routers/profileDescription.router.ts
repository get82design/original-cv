import {
	createDescriptionSchema,
	updateDescriptionSchema,
} from "../../../src/services/schemas/description.schema";
import { profileDescriptionService } from "../../../src/services/profile/profileDescriptionService";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";

export const profileDescriptionRouter = router({
	create: protectedProcedure.input(createDescriptionSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileDescriptionService.create(profile.id, input);
	}),

	me: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileDescriptionService.findByProfileId(profile.id);
	}),

	update: protectedProcedure.input(updateDescriptionSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileDescriptionService.update(profile.id, input);
	}),

	delete: protectedProcedure.mutation(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileDescriptionService.delete(profile.id);
	}),
});
