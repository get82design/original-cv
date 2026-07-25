import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileCompetenceGroupService } from "../../../src/services/profile/profileCompetenceGroupService";
import {
	createCompetenceGroupSchema,
	updateCompetenceGroupSchema,
} from "../../../src/services/schemas/competenceGroup.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";

async function assertCompetenceGroupProfileOwnership(
	groupId: string,
	userId: string,
) {
	const group = await prisma.profileCompetenceGroup.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!group) {
		throw new NotFoundError("Profile Competence Group", groupId);
	}
	if (group.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return group;
}

export const profileCompetenceGroupRouter = router({
	create: protectedProcedure
		.input(createCompetenceGroupSchema)
		.mutation(async ({ input, ctx }) => {
			const profile = await getOwnedProfile(ctx.session.user.id);
			return profileCompetenceGroupService.create(profile.id, input);
		}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileCompetenceGroupService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCompetenceGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceGroupProfileOwnership(
				input.id,
				ctx.session.user.id,
			);
			return profileCompetenceGroupService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceGroupProfileOwnership(
				input.id,
				ctx.session.user.id,
			);
			return profileCompetenceGroupService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceGroupProfileOwnership(
				input.id,
				ctx.session.user.id,
			);
			return profileCompetenceGroupService.delete(input.id);
		}),
});
