import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileSkillService } from "../../../src/services/profile/profileSkillService";
import {
	createSkillSchema,
	updateSkillSchema,
} from "../../../src/services/schemas/skill.schema";
import { protectedProcedure, router } from "../trpc";

async function assertGroupProfileOwnership(groupId: string, userId: string) {
	const group = await prisma.profileSkillGroup.findUnique({
		where: { id: groupId },
		select: {
			id: true,
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

async function assertSkillProfileOwnership(skillId: string, userId: string) {
	const skill = await prisma.profileSkill.findUnique({
		where: { id: skillId },
		select: {
			id: true,
			group: {
				select: {
					profile: { select: { userId: true } },
				},
			},
		},
	});
	if (!skill) {
		throw new NotFoundError("Profile Skill", skillId);
	}
	if (skill.group.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return skill;
}

export const profileSkillRouter = router({
	create: protectedProcedure
		.input(z.object({ groupId: z.string(), data: createSkillSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertGroupProfileOwnership(input.groupId, ctx.session.user.id);
			return profileSkillService.create(input.groupId, input.data);
		}),

	findAllByGroupId: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertGroupProfileOwnership(input.groupId, ctx.session.user.id);
			return profileSkillService.findAllByGroupId(input.groupId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateSkillSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillProfileOwnership(input.id, ctx.session.user.id);
			return profileSkillService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillProfileOwnership(input.id, ctx.session.user.id);
			return profileSkillService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillProfileOwnership(input.id, ctx.session.user.id);
			return profileSkillService.delete(input.id);
		}),
});
