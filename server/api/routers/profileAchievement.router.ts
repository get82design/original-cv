import z from "zod";
import { profileAchievementService } from "../../../src/services/profile/profileAchievementService";
import {
	createAchievementSchema,
	updateAchievementSchema,
} from "../../../src/services/schemas/achievement.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertAchievementProfileOwnership(achievementId: string, userId: string) {
	const achievement = await prisma.achievement.findUnique({
		where: { id: achievementId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!achievement) {
		throw new NotFoundError("Profile Achievement", achievementId);
	}
	if (achievement.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return achievement;
}

export const profileAchievementRouter = router({
	create: protectedProcedure.input(createAchievementSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileAchievementService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileAchievementService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateAchievementSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertAchievementProfileOwnership(input.id, ctx.session.user.id);
			return profileAchievementService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertAchievementProfileOwnership(input.id, ctx.session.user.id);
			return profileAchievementService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertAchievementProfileOwnership(input.id, ctx.session.user.id);
			return profileAchievementService.delete(input.id);
		}),
});
