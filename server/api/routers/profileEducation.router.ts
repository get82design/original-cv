import z from "zod";
import { profileEducationService } from "../../../src/services/profile/profileEducationService";
import {
	createEducationSchema,
	updateEducationSchema,
} from "../../../src/services/schemas/education.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertEducationProfileOwnership(educationId: string, userId: string) {
	const education = await prisma.education.findUnique({
		where: { id: educationId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!education) {
		throw new NotFoundError("Profile Education", educationId);
	}
	if (education.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return education;
}

export const profileEducationRouter = router({
	create: protectedProcedure.input(createEducationSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileEducationService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileEducationService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateEducationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertEducationProfileOwnership(input.id, ctx.session.user.id);
			return profileEducationService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertEducationProfileOwnership(input.id, ctx.session.user.id);
			return profileEducationService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertEducationProfileOwnership(input.id, ctx.session.user.id);
			return profileEducationService.delete(input.id);
		}),
});
