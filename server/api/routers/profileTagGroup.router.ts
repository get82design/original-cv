import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileTagGroupService } from "../../../src/services/profile/profileTagGroupService";
import {
	createTagGroupSchema,
	updateTagGroupSchema,
} from "../../../src/services/schemas/tagGroup.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";

async function assertTagGroupProfileOwnership(groupId: string, userId: string) {
	const group = await prisma.profileTagGroup.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!group) {
		throw new NotFoundError("Profile Tag Group", groupId);
	}
	if (group.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return group;
}

export const profileTagGroupRouter = router({
	create: protectedProcedure
		.input(createTagGroupSchema)
		.mutation(async ({ input, ctx }) => {
			const profile = await getOwnedProfile(ctx.session.user.id);
			return profileTagGroupService.create(profile.id, input);
		}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileTagGroupService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateTagGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertTagGroupProfileOwnership(input.id, ctx.session.user.id);
			return profileTagGroupService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertTagGroupProfileOwnership(input.id, ctx.session.user.id);
			return profileTagGroupService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertTagGroupProfileOwnership(input.id, ctx.session.user.id);
			return profileTagGroupService.delete(input.id);
		}),
});
