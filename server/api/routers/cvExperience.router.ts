import z from "zod";
import { cvExperienceService } from "../../../src/services/cv/cvExperienceService";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";
import {
	createExperienceSchema,
	updateExperienceSchema,
} from "../../../src/services/schemas/experience.schema";

async function assertExperienceCvOwnership(
	experienceId: string,
	userId: string,
) {
	const experience = await prisma.cvExperience.findUnique({
		where: { id: experienceId },
		select: { id: true, cvId: true },
	});
	if (!experience) {
		throw new NotFoundError("CV Experience", experienceId);
	}
	await assertCvOwnership(experience.cvId, userId);
	return experience;
}

export const cvExperienceRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createExperienceSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvExperienceService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvExperienceService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateExperienceSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertExperienceCvOwnership(input.id, ctx.session.user.id);
			return cvExperienceService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertExperienceCvOwnership(input.id, ctx.session.user.id);
			return cvExperienceService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertExperienceCvOwnership(input.id, ctx.session.user.id);
			return cvExperienceService.delete(input.id);
		}),
});
