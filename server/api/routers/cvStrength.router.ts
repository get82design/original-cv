import z from "zod";
import { cvStrengthService } from "../../../src/services/cv/cvStrengthService";
import {
	createStrengthSchema,
	updateStrengthSchema,
} from "../../../src/services/schemas/strength.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertStrengthCvOwnership(strengthId: string, userId: string) {
	const strength = await prisma.cvStrength.findUnique({
		where: { id: strengthId },
		select: { id: true, cvId: true },
	});
	if (!strength) {
		throw new NotFoundError("CV Strength", strengthId);
	}
	await assertCvOwnership(strength.cvId, userId);
	return strength;
}

export const cvStrengthRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createStrengthSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvStrengthService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvStrengthService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateStrengthSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertStrengthCvOwnership(input.id, ctx.session.user.id);
			return cvStrengthService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertStrengthCvOwnership(input.id, ctx.session.user.id);
			return cvStrengthService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertStrengthCvOwnership(input.id, ctx.session.user.id);
			return cvStrengthService.delete(input.id);
		}),
});
