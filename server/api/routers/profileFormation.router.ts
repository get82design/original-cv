import z from "zod";
import { profileFormationService } from "../../../src/services/profile/profileFormationService";
import {
	createFormationSchema,
	updateFormationSchema,
} from "../../../src/services/schemas/formation.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertFormationProfileOwnership(formationId: string, userId: string) {
	const formation = await prisma.formation.findUnique({
		where: { id: formationId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!formation) {
		throw new NotFoundError("Profile Formation", formationId);
	}
	if (formation.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return formation;
}

export const profileFormationRouter = router({
	create: protectedProcedure.input(createFormationSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileFormationService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileFormationService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateFormationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertFormationProfileOwnership(input.id, ctx.session.user.id);
			return profileFormationService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertFormationProfileOwnership(input.id, ctx.session.user.id);
			return profileFormationService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertFormationProfileOwnership(input.id, ctx.session.user.id);
			return profileFormationService.delete(input.id);
		}),
});
