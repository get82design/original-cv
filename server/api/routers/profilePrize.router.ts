import z from "zod";
import { profilePrizeService } from "../../../src/services/profile/profilePrizeService";
import {
	createPrizeSchema,
	updatePrizeSchema,
} from "../../../src/services/schemas/prize.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertPrizeProfileOwnership(prizeId: string, userId: string) {
	const prize = await prisma.prize.findUnique({
		where: { id: prizeId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!prize) {
		throw new NotFoundError("Profile Prize", prizeId);
	}
	if (prize.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return prize;
}

export const profilePrizeRouter = router({
	create: protectedProcedure
		.input(createPrizeSchema)
		.mutation(async ({ input, ctx }) => {
			const profile = await getOwnedProfile(ctx.session.user.id);
			return profilePrizeService.create(profile.id, input);
		}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profilePrizeService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updatePrizeSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertPrizeProfileOwnership(input.id, ctx.session.user.id);
			return profilePrizeService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertPrizeProfileOwnership(input.id, ctx.session.user.id);
			return profilePrizeService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertPrizeProfileOwnership(input.id, ctx.session.user.id);
			return profilePrizeService.delete(input.id);
		}),
});
