import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileCompetenceService } from "../../../src/services/profile/profileCompetenceService";
import {
	createCompetenceSchema,
	updateCompetenceSchema,
} from "../../../src/services/schemas/competence.schema";
import { protectedProcedure, router } from "../trpc";

async function assertGroupProfileOwnership(groupId: string, userId: string) {
	const group = await prisma.profileCompetenceGroup.findUnique({
		where: { id: groupId },
		select: {
			id: true,
			profile: { select: { userId: true } },
		},
	});
	if (!group) {
		throw new NotFoundError("Profile Competence Group", groupId);
	}
	if (group.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return group;
}

async function assertCompetenceProfileOwnership(competenceId: string, userId: string) {
	const competence = await prisma.profileCompetence.findUnique({
		where: { id: competenceId },
		select: {
			id: true,
			group: {
				select: {
					profile: { select: { userId: true } },
				},
			},
		},
	});
	if (!competence) {
		throw new NotFoundError("Profile Competence", competenceId);
	}
	if (competence.group.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return competence;
}

export const profileCompetenceRouter = router({
	create: protectedProcedure
		.input(z.object({ groupId: z.string(), data: createCompetenceSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertGroupProfileOwnership(input.groupId, ctx.session.user.id);
			return profileCompetenceService.create(input.groupId, input.data);
		}),

	findAllByGroupId: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertGroupProfileOwnership(input.groupId, ctx.session.user.id);
			return profileCompetenceService.findAllByGroupId(input.groupId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCompetenceSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceProfileOwnership(input.id, ctx.session.user.id);
			return profileCompetenceService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceProfileOwnership(input.id, ctx.session.user.id);
			return profileCompetenceService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCompetenceProfileOwnership(input.id, ctx.session.user.id);
			return profileCompetenceService.delete(input.id);
		}),
});
