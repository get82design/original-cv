import z from "zod";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";
import { profileMissionVolunteeringService } from "../../../src/services/profile/profileMissionVolunteeringService";
import {
	createMissionSchema,
	updateMissionSchema,
} from "../../../src/services/schemas/mission.schema";
import { protectedProcedure, router } from "../trpc";

async function assertVolunteeringProfileOwnership(
	volunteeringId: string,
	userId: string,
) {
	const volunteering = await prisma.volunteering.findUnique({
		where: { id: volunteeringId },
		select: {
			id: true,
			profile: { select: { userId: true } },
		},
	});
	if (!volunteering) {
		throw new NotFoundError("Profile Volunteering", volunteeringId);
	}
	if (volunteering.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return volunteering;
}

async function assertMissionProfileOwnership(
	missionId: string,
	userId: string,
) {
	const mission = await prisma.missionVolunteering.findUnique({
		where: { id: missionId },
		select: {
			id: true,
			volunteering: {
				select: {
					profile: { select: { userId: true } },
				},
			},
		},
	});
	if (!mission) {
		throw new NotFoundError("Profile Mission Volunteering", missionId);
	}
	if (mission.volunteering.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return mission;
}

export const profileMissionVolunteeringRouter = router({
	create: protectedProcedure
		.input(z.object({ volunteeringId: z.string(), data: createMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertVolunteeringProfileOwnership(
				input.volunteeringId,
				ctx.session.user.id,
			);
			return profileMissionVolunteeringService.create(
				input.volunteeringId,
				input.data,
			);
		}),

	findAllByVolunteeringId: protectedProcedure
		.input(z.object({ volunteeringId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertVolunteeringProfileOwnership(
				input.volunteeringId,
				ctx.session.user.id,
			);
			return profileMissionVolunteeringService.findAllByProfileVolunteeringId(
				input.volunteeringId,
			);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateMissionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionVolunteeringService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionVolunteeringService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertMissionProfileOwnership(input.id, ctx.session.user.id);
			return profileMissionVolunteeringService.delete(input.id);
		}),
});
