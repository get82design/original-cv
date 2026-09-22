import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileMissionProjectService } from "../../../src/services/profile/profileMissionProjectService";
import {
	createMissionSchema,
	updateMissionSchema,
} from "../../../src/services/schemas/mission.schema";
import { protectedProcedure, router } from "../trpc";

async function assertProjectProfileOwnership(projectId: string, userId: string) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			id: true,
			profile: { select: { userId: true } },
		},
	});
	if (!project) {
		throw new NotFoundError("Profile Project", projectId);
	}
	if (project.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return project;
}

async function assertMissionProfileOwnership(missionId: string, userId: string) {
	const mission = await prisma.missionProject.findUnique({
		where: { id: missionId },
		select: {
			id: true,
			project: {
				select: {
					profile: { select: { userId: true } },
				},
			},
		},
	});
	if (!mission) {
		throw new NotFoundError("Profile Mission Project", missionId);
	}
	if (mission.project.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return mission;
}

export const profileMissionProjectRouter = router({
	create: protectedProcedure
		.input(z.object({ projectId: z.string(), data: createMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertProjectProfileOwnership(input.projectId, ctx.session.user.id);
			return profileMissionProjectService.create(input.projectId, input.data);
		}),

	findAllByProjectId: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertProjectProfileOwnership(input.projectId, ctx.session.user.id);
			return profileMissionProjectService.findAllByProfileProjectId(input.projectId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionProjectService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionProjectService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionProjectService.delete(input.id);
		}),
});
