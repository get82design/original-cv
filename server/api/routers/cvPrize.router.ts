import z from "zod";
import { cvPrizeService } from "../../../src/services/cv/cvPrizeService";
import {
	createPrizeSchema,
	updatePrizeSchema,
} from "../../../src/services/schemas/prize.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertPrizeCvOwnership(prizeId: string, userId: string) {
	const prize = await prisma.cvPrize.findUnique({
		where: { id: prizeId },
		select: { id: true, cvId: true },
	});
	if (!prize) {
		throw new NotFoundError("CV Prize", prizeId);
	}
	await assertCvOwnership(prize.cvId, userId);
	return prize;
}

export const cvPrizeRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createPrizeSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPrizeService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPrizeService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updatePrizeSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertPrizeCvOwnership(input.id, ctx.session.user.id);
			return cvPrizeService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertPrizeCvOwnership(input.id, ctx.session.user.id);
			return cvPrizeService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertPrizeCvOwnership(input.id, ctx.session.user.id);
			return cvPrizeService.delete(input.id);
		}),
});
