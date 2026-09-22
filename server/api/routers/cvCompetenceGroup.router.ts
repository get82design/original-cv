import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvCompetenceGroupService } from "../../../src/services/cv/cvCompetenceGroupService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createCompetenceGroupSchema,
	updateCompetenceGroupSchema,
} from "../../../src/services/schemas/competenceGroup.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertCompetenceGroupCvOwnership(groupId: string, userId: string) {
	const group = await prisma.cvCompetenceGroup.findUnique({
		where: { id: groupId },
		select: { id: true, cvId: true },
	});
	if (!group) {
		throw new NotFoundError("CV Competence Group", groupId);
	}
	await assertCvOwnership(group.cvId, userId);
	return group;
}

export const cvCompetenceGroupRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createCompetenceGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvCompetenceGroupService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvCompetenceGroupService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCompetenceGroupSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceGroupCvOwnership(input.id, ctx.session.user.id);
			return cvCompetenceGroupService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceGroupCvOwnership(input.id, ctx.session.user.id);
			return cvCompetenceGroupService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceGroupCvOwnership(input.id, ctx.session.user.id);
			return cvCompetenceGroupService.delete(input.id);
		}),
});
