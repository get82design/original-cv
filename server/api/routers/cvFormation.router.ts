import z from "zod";
import { cvFormationService } from "../../../src/services/cv/cvFormationService";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";
import {
	createFormationSchema,
	updateFormationSchema,
} from "../../../src/services/schemas/formation.schema";

async function assertFormationCvOwnership(formationId: string, userId: string) {
	const formation = await prisma.cvFormation.findUnique({
		where: { id: formationId },
		select: { id: true, cvId: true },
	});
	if (!formation) {
		throw new NotFoundError("CV Formation", formationId);
	}
	await assertCvOwnership(formation.cvId, userId);
	return formation;
}

export const cvFormationRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createFormationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvFormationService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvFormationService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateFormationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertFormationCvOwnership(input.id, ctx.session.user.id);
			return cvFormationService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertFormationCvOwnership(input.id, ctx.session.user.id);
			return cvFormationService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertFormationCvOwnership(input.id, ctx.session.user.id);
			return cvFormationService.delete(input.id);
		}),
});
