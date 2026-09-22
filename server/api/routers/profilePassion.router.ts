import z from "zod";
import { profilePassionService } from "../../../src/services/profile/profilePassionService";
import {
	createPassionInputSchema,
	updatePassionInputSchema,
} from "../../../src/services/schemas/passion.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertPassionProfileOwnership(passionId: string, userId: string) {
	const passion = await prisma.passion.findUnique({
		where: { id: passionId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!passion) {
		throw new NotFoundError("Profile Passion", passionId);
	}
	if (passion.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return passion;
}

export const profilePassionRouter = router({
	create: protectedProcedure.input(createPassionInputSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profilePassionService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profilePassionService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updatePassionInputSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertPassionProfileOwnership(input.id, ctx.session.user.id);
			return profilePassionService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertPassionProfileOwnership(input.id, ctx.session.user.id);
			return profilePassionService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertPassionProfileOwnership(input.id, ctx.session.user.id);
			return profilePassionService.delete(input.id);
		}),
});
