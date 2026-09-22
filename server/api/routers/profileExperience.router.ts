import z from "zod";
import { profileExperienceService } from "../../../src/services/profile/profileExperienceService";
import {
	createExperienceSchema,
	updateExperienceSchema,
} from "../../../src/services/schemas/experience.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertExperienceProfileOwnership(experienceId: string, userId: string) {
	const experience = await prisma.experience.findUnique({
		where: { id: experienceId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!experience) {
		throw new NotFoundError("Profile Experience", experienceId);
	}
	if (experience.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return experience;
}

export const profileExperienceRouter = router({
	create: protectedProcedure.input(createExperienceSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileExperienceService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileExperienceService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateExperienceSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertExperienceProfileOwnership(input.id, ctx.session.user.id);
			return profileExperienceService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertExperienceProfileOwnership(input.id, ctx.session.user.id);
			return profileExperienceService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertExperienceProfileOwnership(input.id, ctx.session.user.id);
			return profileExperienceService.delete(input.id);
		}),
});
