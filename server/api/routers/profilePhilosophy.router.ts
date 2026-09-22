import {
	createPhilosophySchema,
	updatePhilosophySchema,
} from "../../../src/services/schemas/philosophy.schema";
import { profilePhilosophyService } from "../../../src/services/profile/profilePhilosophyService";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";

export const profilePhilosophyRouter = router({
	create: protectedProcedure.input(createPhilosophySchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profilePhilosophyService.create(profile.id, input);
	}),

	me: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profilePhilosophyService.findByProfileId(profile.id);
	}),

	update: protectedProcedure.input(updatePhilosophySchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profilePhilosophyService.update(profile.id, input);
	}),

	delete: protectedProcedure.mutation(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profilePhilosophyService.delete(profile.id);
	}),
});
