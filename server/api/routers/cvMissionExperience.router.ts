import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvMissionExperienceService } from "../../../src/services/cv/cvMissionExperienceService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createMissionSchema,
	updateMissionSchema,
} from "../../../src/services/schemas/mission.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertExperienceCvOwnership(experienceId: string, userId: string) {
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

async function assertMissionCvOwnership(missionId: string, userId: string) {
	const mission = await prisma.cvMissionExperience.findUnique({
		where: { id: missionId },
		select: {
			id: true,
			cvExperience: { select: { cvId: true } },
		},
	});
	if (!mission) {
		throw new NotFoundError("CV Mission Experience", missionId);
	}
	await assertCvOwnership(mission.cvExperience.cvId, userId);
	return mission;
}

export const cvMissionExperienceRouter = router({
	create: protectedProcedure
		.input(z.object({ experienceId: z.string(), data: createMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertExperienceCvOwnership(input.experienceId, ctx.session.user.id);
			return cvMissionExperienceService.create(input.experienceId, input.data);
		}),

	findAllByExperienceId: protectedProcedure
		.input(z.object({ experienceId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertExperienceCvOwnership(input.experienceId, ctx.session.user.id);
			return cvMissionExperienceService.findAllByCvExperienceId(input.experienceId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionCvOwnership(input.id, ctx.session.user.id);
			return cvMissionExperienceService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionCvOwnership(input.id, ctx.session.user.id);
			return cvMissionExperienceService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionCvOwnership(input.id, ctx.session.user.id);
			return cvMissionExperienceService.delete(input.id);
		}),
});
