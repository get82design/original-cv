import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvTagGroupService } from "../../../src/services/cv/cvTagGroupService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createTagGroupSchema,
	updateTagGroupSchema,
} from "../../../src/services/schemas/tagGroup.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertTagGroupCvOwnership(groupId: string, userId: string) {
	const group = await prisma.cvTagGroup.findUnique({
		where: { id: groupId },
		select: { id: true, cvId: true },
	});
	if (!group) {
		throw new NotFoundError("CV Tag Group", groupId);
	}
	await assertCvOwnership(group.cvId, userId);
	return group;
}

export const cvTagGroupRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createTagGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvTagGroupService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvTagGroupService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateTagGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertTagGroupCvOwnership(input.id, ctx.session.user.id);
			return cvTagGroupService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertTagGroupCvOwnership(input.id, ctx.session.user.id);
			return cvTagGroupService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertTagGroupCvOwnership(input.id, ctx.session.user.id);
			return cvTagGroupService.delete(input.id);
		}),
});
