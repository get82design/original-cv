import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvTagService } from "../../../src/services/cv/cvTagService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createTagSchema,
	updateTagSchema,
} from "../../../src/services/schemas/tag.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertGroupCvOwnership(groupId: string, userId: string) {
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

async function assertTagCvOwnership(tagId: string, userId: string) {
	const tag = await prisma.cvTag.findUnique({
		where: { id: tagId },
		select: {
			id: true,
			group: { select: { cvId: true } },
		},
	});
	if (!tag) {
		throw new NotFoundError("CV Tag", tagId);
	}
	await assertCvOwnership(tag.group.cvId, userId);
	return tag;
}

export const cvTagRouter = router({
	create: protectedProcedure
		.input(z.object({ groupId: z.string(), data: createTagSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertGroupCvOwnership(input.groupId, ctx.session.user.id);
			return cvTagService.create(input.groupId, input.data);
		}),

	findAllByGroupId: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertGroupCvOwnership(input.groupId, ctx.session.user.id);
			return cvTagService.findAllByGroupId(input.groupId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateTagSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertTagCvOwnership(input.id, ctx.session.user.id);
			return cvTagService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertTagCvOwnership(input.id, ctx.session.user.id);
			return cvTagService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertTagCvOwnership(input.id, ctx.session.user.id);
			return cvTagService.delete(input.id);
		}),
});
