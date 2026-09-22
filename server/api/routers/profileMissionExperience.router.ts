import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileMissionExperienceService } from "../../../src/services/profile/profileMissionExperienceService";
import {
	createMissionSchema,
	updateMissionSchema,
} from "../../../src/services/schemas/mission.schema";
import { protectedProcedure, router } from "../trpc";

async function assertExperienceProfileOwnership(experienceId: string, userId: string) {
	const experience = await prisma.experience.findUnique({
		where: { id: experienceId },
		select: {
			id: true,
			profile: { select: { userId: true } },
		},
	});
	if (!experience) {
		throw new NotFoundError("Profile Experience", experienceId);
	}
	if (experience.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return experience;
}

async function assertMissionProfileOwnership(missionId: string, userId: string) {
	const mission = await prisma.missionExperience.findUnique({
		where: { id: missionId },
		select: {
			id: true,
			experience: {
				select: {
					profile: { select: { userId: true } },
				},
			},
		},
	});
	if (!mission) {
		throw new NotFoundError("Profile Mission Experience", missionId);
	}
	if (mission.experience.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return mission;
}

export const profileMissionExperienceRouter = router({
	create: protectedProcedure
		.input(z.object({ experienceId: z.string(), data: createMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertExperienceProfileOwnership(input.experienceId, ctx.session.user.id);
			return profileMissionExperienceService.create(input.experienceId, input.data);
		}),

	findAllByExperienceId: protectedProcedure
		.input(z.object({ experienceId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertExperienceProfileOwnership(input.experienceId, ctx.session.user.id);
			return profileMissionExperienceService.findAllByExperienceId(input.experienceId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionExperienceService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionExperienceService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionExperienceService.delete(input.id);
		}),
});
