import z from "zod";
import { profileProjectService } from "../../../src/services/profile/profileProjectService";
import {
	createProjectSchema,
	updateProjectSchema,
} from "../../../src/services/schemas/project.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertProjectProfileOwnership(projectId: string, userId: string) {
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		select: {
			id: true,
			profileId: true,
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

export const profileProjectRouter = router({
	create: protectedProcedure.input(createProjectSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileProjectService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileProjectService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateProjectSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertProjectProfileOwnership(input.id, ctx.session.user.id);
			return profileProjectService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertProjectProfileOwnership(input.id, ctx.session.user.id);
			return profileProjectService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertProjectProfileOwnership(input.id, ctx.session.user.id);
			return profileProjectService.delete(input.id);
		}),
});
