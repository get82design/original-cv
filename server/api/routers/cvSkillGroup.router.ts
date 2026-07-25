import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvSkillGroupService } from "../../../src/services/cv/cvSkillGroupService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createSkillGroupSchema,
	updateSkillGroupSchema,
} from "../../../src/services/schemas/skillGroup.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertSkillGroupCvOwnership(groupId: string, userId: string) {
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

export const cvSkillGroupRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createSkillGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvSkillGroupService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvSkillGroupService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateSkillGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillGroupCvOwnership(input.id, ctx.session.user.id);
			return cvSkillGroupService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillGroupCvOwnership(input.id, ctx.session.user.id);
			return cvSkillGroupService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertSkillGroupCvOwnership(input.id, ctx.session.user.id);
			return cvSkillGroupService.delete(input.id);
		}),
});
