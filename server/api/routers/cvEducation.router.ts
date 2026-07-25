import z from "zod";
import { cvEducationService } from "../../../src/services/cv/cvEducationService";
import {
	createEducationSchema,
	updateEducationSchema,
} from "../../../src/services/schemas/education.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertEducationCvOwnership(educationId: string, userId: string) {
	const education = await prisma.cvEducation.findUnique({
		where: { id: educationId },
		select: { id: true, cvId: true },
	});
	if (!education) {
		throw new NotFoundError("CV Education", educationId);
	}
	await assertCvOwnership(education.cvId, userId);
	return education;
}

export const cvEducationRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createEducationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvEducationService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvEducationService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateEducationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertEducationCvOwnership(input.id, ctx.session.user.id);
			return cvEducationService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertEducationCvOwnership(input.id, ctx.session.user.id);
			return cvEducationService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertEducationCvOwnership(input.id, ctx.session.user.id);
			return cvEducationService.delete(input.id);
		}),
});
