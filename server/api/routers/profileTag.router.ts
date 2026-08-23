import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileTagService } from "../../../src/services/profile/profileTagService";
import {
	createTagSchema,
	updateTagSchema,
} from "../../../src/services/schemas/tag.schema";
import { protectedProcedure, router } from "../trpc";

async function assertGroupProfileOwnership(groupId: string, userId: string) {
	const group = await prisma.profileTagGroup.findUnique({
		where: { id: groupId },
		select: {
			id: true,
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

async function assertTagProfileOwnership(tagId: string, userId: string) {
	const tag = await prisma.profileTag.findUnique({
		where: { id: tagId },
		select: {
			id: true,
			group: {
				select: {
					profile: { select: { userId: true } },
				},
			},
		},
	});
	if (!tag) {
		throw new NotFoundError("Profile Tag", tagId);
	}
	if (tag.group.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return tag;
}

export const profileTagRouter = router({
	create: protectedProcedure
		.input(z.object({ groupId: z.string(), data: createTagSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertGroupProfileOwnership(input.groupId, ctx.session.user.id);
			return profileTagService.create(input.groupId, input.data);
		}),

	findAllByGroupId: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertGroupProfileOwnership(input.groupId, ctx.session.user.id);
			return profileTagService.findAllByGroupId(input.groupId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateTagSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertTagProfileOwnership(input.id, ctx.session.user.id);
			return profileTagService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertTagProfileOwnership(input.id, ctx.session.user.id);
			return profileTagService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertTagProfileOwnership(input.id, ctx.session.user.id);
			return profileTagService.delete(input.id);
		}),
});
