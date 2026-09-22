import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileSkillGroupService } from "../../../src/services/profile/profileSkillGroupService";
import {
	createSkillGroupSchema,
	updateSkillGroupSchema,
} from "../../../src/services/schemas/skillGroup.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";

async function assertSkillGroupProfileOwnership(groupId: string, userId: string) {
	const group = await prisma.profileSkillGroup.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!group) {
		throw new NotFoundError("Profile Skill Group", groupId);
	}
	if (group.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return group;
}

export const profileSkillGroupRouter = router({
	create: protectedProcedure.input(createSkillGroupSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileSkillGroupService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileSkillGroupService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateSkillGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillGroupProfileOwnership(input.id, ctx.session.user.id);
			return profileSkillGroupService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillGroupProfileOwnership(input.id, ctx.session.user.id);
			return profileSkillGroupService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillGroupProfileOwnership(input.id, ctx.session.user.id);
			return profileSkillGroupService.delete(input.id);
		}),
});
