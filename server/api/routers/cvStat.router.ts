import z from "zod";
import { cvStatService } from "../../../src/services/cv/cvStatService";
import { createStatSchema, updateStatSchema } from "../../../src/services/schemas/stat.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertStatCvOwnership(statId: string, userId: string) {
	const stat = await prisma.cvStat.findUnique({
		where: { id: statId },
		select: { id: true, cvId: true },
	});
	if (!stat) {
		throw new NotFoundError("CV Stat", statId);
	}
	await assertCvOwnership(stat.cvId, userId);
	return stat;
}

export const cvStatRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createStatSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvStatService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvStatService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateStatSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertStatCvOwnership(input.id, ctx.session.user.id);
			return cvStatService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertStatCvOwnership(input.id, ctx.session.user.id);
			return cvStatService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertStatCvOwnership(input.id, ctx.session.user.id);
			return cvStatService.delete(input.id);
		}),
});
