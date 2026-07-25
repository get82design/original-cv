import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvCompetenceService } from "../../../src/services/cv/cvCompetenceService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createCompetenceSchema,
	updateCompetenceSchema,
} from "../../../src/services/schemas/competence.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertGroupCvOwnership(groupId: string, userId: string) {
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

async function assertCompetenceCvOwnership(
	competenceId: string,
	userId: string,
) {
	const competence = await prisma.cvCompetence.findUnique({
		where: { id: competenceId },
		select: {
			id: true,
			group: { select: { cvId: true } },
		},
	});
	if (!competence) {
		throw new NotFoundError("CV Competence", competenceId);
	}
	await assertCvOwnership(competence.group.cvId, userId);
	return competence;
}

export const cvCompetenceRouter = router({
	create: protectedProcedure
		.input(z.object({ groupId: z.string(), data: createCompetenceSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertGroupCvOwnership(input.groupId, ctx.session.user.id);
			return cvCompetenceService.create(input.groupId, input.data);
		}),

	findAllByGroupId: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertGroupCvOwnership(input.groupId, ctx.session.user.id);
			return cvCompetenceService.findAllByGroupId(input.groupId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCompetenceSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceCvOwnership(input.id, ctx.session.user.id);
			return cvCompetenceService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceCvOwnership(input.id, ctx.session.user.id);
			return cvCompetenceService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceCvOwnership(input.id, ctx.session.user.id);
			return cvCompetenceService.delete(input.id);
		}),
});
