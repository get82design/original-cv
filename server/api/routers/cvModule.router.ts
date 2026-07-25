import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvModuleService } from "../../../src/services/cv/cvModuleService";
import { NotFoundError } from "../../../src/services/errors";
import {
	createCvModuleSchema,
	updateCvModuleSchema,
} from "../../../src/services/schemas/cvModule.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

async function assertModuleCvOwnership(moduleId: string, userId: string) {
	const module = await prisma.cVModule.findUnique({
		where: { id: moduleId },
		select: { id: true, cvId: true },
	});
	if (!module) {
		throw new NotFoundError("CV Module", moduleId);
	}
	await assertCvOwnership(module.cvId, userId);
	return module;
}

export const cvModuleRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createCvModuleSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvModuleService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvModuleService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCvModuleSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertModuleCvOwnership(input.id, ctx.session.user.id);
			return cvModuleService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertModuleCvOwnership(input.id, ctx.session.user.id);
			return cvModuleService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertModuleCvOwnership(input.id, ctx.session.user.id);
			return cvModuleService.delete(input.id);
		}),
});