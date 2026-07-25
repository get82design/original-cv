import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvMissionProjectService } from "../../../src/services/cv/cvMissionProjectService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createMissionSchema,
	updateMissionSchema,
} from "../../../src/services/schemas/mission.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertProjectCvOwnership(projectId: string, userId: string) {
	const project = await prisma.cvProject.findUnique({
		where: { id: projectId },
		select: { id: true, cvId: true },
	});
	if (!project) {
		throw new NotFoundError("CV Project", projectId);
	}
	await assertCvOwnership(project.cvId, userId);
	return project;
}

async function assertMissionCvOwnership(missionId: string, userId: string) {
	const mission = await prisma.cvMissionProject.findUnique({
		where: { id: missionId },
		select: {
			id: true,
			cvProject: { select: { cvId: true } },
		},
	});
	if (!mission) {
		throw new NotFoundError("CV Mission Project", missionId);
	}
	await assertCvOwnership(mission.cvProject.cvId, userId);
	return mission;
}

export const cvMissionProjectRouter = router({
	create: protectedProcedure
		.input(z.object({ projectId: z.string(), data: createMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertProjectCvOwnership(input.projectId, ctx.session.user.id);
			return cvMissionProjectService.create(input.projectId, input.data);
		}),

	findAllByProjectId: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertProjectCvOwnership(input.projectId, ctx.session.user.id);
			return cvMissionProjectService.findAllByCvProjectId(input.projectId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionCvOwnership(input.id, ctx.session.user.id);
			return cvMissionProjectService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionCvOwnership(input.id, ctx.session.user.id);
			return cvMissionProjectService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionCvOwnership(input.id, ctx.session.user.id);
			return cvMissionProjectService.delete(input.id);
		}),
});
