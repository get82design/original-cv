import z from "zod";
import { profileExpertiseService } from "../../../src/services/profile/profileExpertiseService";
import {
	createExpertiseSchema,
	updateExpertiseSchema,
} from "../../../src/services/schemas/expertise.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertExpertiseProfileOwnership(expertiseId: string, userId: string) {
	const expertise = await prisma.expertise.findUnique({
		where: { id: expertiseId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!expertise) {
		throw new NotFoundError("Profile Expertise", expertiseId);
	}
	if (expertise.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return expertise;
}

export const profileExpertiseRouter = router({
	create: protectedProcedure.input(createExpertiseSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileExpertiseService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileExpertiseService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateExpertiseSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertExpertiseProfileOwnership(input.id, ctx.session.user.id);
			return profileExpertiseService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertExpertiseProfileOwnership(input.id, ctx.session.user.id);
			return profileExpertiseService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertExpertiseProfileOwnership(input.id, ctx.session.user.id);
			return profileExpertiseService.delete(input.id);
		}),
});
