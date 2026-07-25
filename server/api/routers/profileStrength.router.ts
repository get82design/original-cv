import z from "zod";
import { profileStrengthService } from "../../../src/services/profile/profileStrengthService";
import {
	createStrengthSchema,
	updateStrengthSchema,
} from "../../../src/services/schemas/strength.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertStrengthProfileOwnership(
	strengthId: string,
	userId: string,
) {
	const strength = await prisma.strength.findUnique({
		where: { id: strengthId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!strength) {
		throw new NotFoundError("Profile Strength", strengthId);
	}
	if (strength.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return strength;
}

export const profileStrengthRouter = router({
	create: protectedProcedure
		.input(createStrengthSchema)
		.mutation(async ({ input, ctx }) => {
			const profile = await getOwnedProfile(ctx.session.user.id);
			return profileStrengthService.create(profile.id, input);
		}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileStrengthService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateStrengthSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertStrengthProfileOwnership(input.id, ctx.session.user.id);
			return profileStrengthService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertStrengthProfileOwnership(input.id, ctx.session.user.id);
			return profileStrengthService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertStrengthProfileOwnership(input.id, ctx.session.user.id);
			return profileStrengthService.delete(input.id);
		}),
});
