import z from "zod";
import { cvExpertiseService } from "../../../src/services/cv/cvExpertiseService";
import {
	createExpertiseSchema,
	updateExpertiseSchema,
} from "../../../src/services/schemas/expertise.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertExpertiseCvOwnership(expertiseId: string, userId: string) {
	const expertise = await prisma.cvExpertise.findUnique({
		where: { id: expertiseId },
		select: { id: true, cvId: true },
	});
	if (!expertise) {
		throw new NotFoundError("CV Expertise", expertiseId);
	}
	await assertCvOwnership(expertise.cvId, userId);
	return expertise;
}

export const cvExpertiseRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createExpertiseSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvExpertiseService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvExpertiseService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateExpertiseSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertExpertiseCvOwnership(input.id, ctx.session.user.id);
			return cvExpertiseService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertExpertiseCvOwnership(input.id, ctx.session.user.id);
			return cvExpertiseService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertExpertiseCvOwnership(input.id, ctx.session.user.id);
			return cvExpertiseService.delete(input.id);
		}),
});
