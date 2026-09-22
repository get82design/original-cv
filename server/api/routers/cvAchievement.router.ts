import z from "zod";
import { cvAchievementService } from "../../../src/services/cv/cvAchievementService";
import {
	createAchievementSchema,
	updateAchievementSchema,
} from "../../../src/services/schemas/achievement.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertAchievementCvOwnership(achievementId: string, userId: string) {
	const achievement = await prisma.cvAchievement.findUnique({
		where: { id: achievementId },
		select: { id: true, cvId: true },
	});
	if (!achievement) {
		throw new NotFoundError("CV Achievement", achievementId);
	}
	await assertCvOwnership(achievement.cvId, userId);
	return achievement;
}

export const cvAchievementRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createAchievementSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvAchievementService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvAchievementService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateAchievementSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertAchievementCvOwnership(input.id, ctx.session.user.id);
			return cvAchievementService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertAchievementCvOwnership(input.id, ctx.session.user.id);
			return cvAchievementService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertAchievementCvOwnership(input.id, ctx.session.user.id);
			return cvAchievementService.delete(input.id);
		}),
});
