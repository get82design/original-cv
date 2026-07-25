import z from "zod";
import { cvPassionService } from "../../../src/services/cv/cvPassionService";
import {
	createPassionInputSchema,
	updatePassionInputSchema,
} from "../../../src/services/schemas/passion.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertPassionCvOwnership(passionId: string, userId: string) {
	const passion = await prisma.cvPassion.findUnique({
		where: { id: passionId },
		select: { id: true, cvId: true },
	});
	if (!passion) {
		throw new NotFoundError("CV Passion", passionId);
	}
	await assertCvOwnership(passion.cvId, userId);
	return passion;
}

export const cvPassionRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createPassionInputSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPassionService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPassionService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updatePassionInputSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertPassionCvOwnership(input.id, ctx.session.user.id);
			return cvPassionService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertPassionCvOwnership(input.id, ctx.session.user.id);
			return cvPassionService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertPassionCvOwnership(input.id, ctx.session.user.id);
			return cvPassionService.delete(input.id);
		}),
});
