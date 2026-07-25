import z from "zod";
import { profileVolunteeringService } from "../../../src/services/profile/profileVolunteeringService";
import {
	createVolunteeringSchema,
	updateVolunteeringSchema,
} from "../../../src/services/schemas/volunteering.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertVolunteeringProfileOwnership(
	volunteeringId: string,
	userId: string,
) {
	const volunteering = await prisma.volunteering.findUnique({
		where: { id: volunteeringId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!volunteering) {
		throw new NotFoundError("Profile Volunteering", volunteeringId);
	}
	if (volunteering.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return volunteering;
}

export const profileVolunteeringRouter = router({
	create: protectedProcedure
		.input(createVolunteeringSchema)
		.mutation(async ({ input, ctx }) => {
			const profile = await getOwnedProfile(ctx.session.user.id);
			return profileVolunteeringService.create(profile.id, input);
		}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileVolunteeringService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateVolunteeringSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertVolunteeringProfileOwnership(input.id, ctx.session.user.id);
			return profileVolunteeringService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertVolunteeringProfileOwnership(input.id, ctx.session.user.id);
			return profileVolunteeringService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertVolunteeringProfileOwnership(input.id, ctx.session.user.id);
			return profileVolunteeringService.delete(input.id);
		}),
});
