import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvMissionVolunteeringService } from "../../../src/services/cv/cvMissionsVolunteeringService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createMissionSchema,
	updateMissionSchema,
} from "../../../src/services/schemas/mission.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertVolunteeringCvOwnership(
	volunteeringId: string,
	userId: string,
) {
	const volunteering = await prisma.cvVolunteering.findUnique({
		where: { id: volunteeringId },
		select: { id: true, cvId: true },
	});
	if (!volunteering) {
		throw new NotFoundError("CV Volunteering", volunteeringId);
	}
	await assertCvOwnership(volunteering.cvId, userId);
	return volunteering;
}

async function assertMissionVolunteeringCvOwnership(
	missionId: string,
	userId: string,
) {
	const mission = await prisma.cvMissionVolunteering.findUnique({
		where: { id: missionId },
		select: {
			id: true,
			cvVolunteering: { select: { cvId: true } },
		},
	});
	if (!mission) {
		throw new NotFoundError("CV Mission Volunteering", missionId);
	}
	await assertCvOwnership(mission.cvVolunteering.cvId, userId);
	return mission;
}

export const cvMissionVolunteeringRouter = router({
	create: protectedProcedure
		.input(z.object({ volunteeringId: z.string(), data: createMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertVolunteeringCvOwnership(
				input.volunteeringId,
				ctx.session.user.id,
			);
			return cvMissionVolunteeringService.create(
				input.volunteeringId,
				input.data,
			);
		}),

	findAllByVolunteeringId: protectedProcedure
		.input(z.object({ volunteeringId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertVolunteeringCvOwnership(
				input.volunteeringId,
				ctx.session.user.id,
			);
			return cvMissionVolunteeringService.findAllByCvVolunteeringId(
				input.volunteeringId,
			);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionVolunteeringCvOwnership(input.id, ctx.session.user.id);
			return cvMissionVolunteeringService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionVolunteeringCvOwnership(input.id, ctx.session.user.id);
			return cvMissionVolunteeringService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionVolunteeringCvOwnership(input.id, ctx.session.user.id);
			return cvMissionVolunteeringService.delete(input.id);
		}),
});
