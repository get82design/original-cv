import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvSkillService } from "../../../src/services/cv/cvSkillService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createSkillSchema,
	updateSkillSchema,
} from "../../../src/services/schemas/skill.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertGroupCvOwnership(groupId: string, userId: string) {
	const group = await prisma.cvSkillGroup.findUnique({
		where: { id: groupId },
		select: { id: true, cvId: true },
	});
	if (!group) {
		throw new NotFoundError("CV Skill Group", groupId);
	}
	await assertCvOwnership(group.cvId, userId);
	return group;
}

async function assertSkillCvOwnership(skillId: string, userId: string) {
	const skill = await prisma.cvSkill.findUnique({
		where: { id: skillId },
		select: {
			id: true,
			group: { select: { cvId: true } },
		},
	});
	if (!skill) {
		throw new NotFoundError("CV Skill", skillId);
	}
	await assertCvOwnership(skill.group.cvId, userId);
	return skill;
}

export const cvSkillRouter = router({
	create: protectedProcedure
		.input(z.object({ groupId: z.string(), data: createSkillSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertGroupCvOwnership(input.groupId, ctx.session.user.id);
			return cvSkillService.create(input.groupId, input.data);
		}),

	findAllByGroupId: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertGroupCvOwnership(input.groupId, ctx.session.user.id);
			return cvSkillService.findAllByGroupId(input.groupId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateSkillSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillCvOwnership(input.id, ctx.session.user.id);
			return cvSkillService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillCvOwnership(input.id, ctx.session.user.id);
			return cvSkillService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillCvOwnership(input.id, ctx.session.user.id);
			return cvSkillService.delete(input.id);
		}),
});
