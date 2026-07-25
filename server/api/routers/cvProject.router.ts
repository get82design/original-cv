import z from "zod";
import { cvProjectService } from "../../../src/services/cv/cvProjectService";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";
import {
	createProjectSchema,
	updateProjectSchema,
} from "../../../src/services/schemas/project.schema";

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

export const cvProjectRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createProjectSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvProjectService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvProjectService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateProjectSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertProjectCvOwnership(input.id, ctx.session.user.id);
			return cvProjectService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertProjectCvOwnership(input.id, ctx.session.user.id);
			return cvProjectService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertProjectCvOwnership(input.id, ctx.session.user.id);
			return cvProjectService.delete(input.id);
		}),
});
