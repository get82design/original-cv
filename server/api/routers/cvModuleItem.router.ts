import z from "zod";
import { prisma } from "../../../lib/prisma";
import { cvModuleItemService } from "../../../src/services/cv/cvModuleItemService";
import { NotFoundError } from "../../../src/services/errors";
import { cvModuleItemSchema } from "../../../src/services/schemas/cvModuleItem.schema";
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

async function assertModuleItemCvOwnership(itemId: string, userId: string) {
	const item = await prisma.cVModuleItem.findUnique({
		where: { id: itemId },
		select: {
			id: true,
			module: { select: { cvId: true } },
		},
	});
	if (!item) {
		throw new NotFoundError("CV Module Item", itemId);
	}
	await assertCvOwnership(item.module.cvId, userId);
	return item;
}

export const cvModuleItemRouter = router({
	create: protectedProcedure
		.input(z.object({ moduleId: z.string(), data: cvModuleItemSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertModuleCvOwnership(input.moduleId, ctx.session.user.id);
			return cvModuleItemService.create(input.moduleId, input.data);
		}),

	findAllByModuleId: protectedProcedure
		.input(z.object({ moduleId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertModuleCvOwnership(input.moduleId, ctx.session.user.id);
			return cvModuleItemService.findAllByModuleId(input.moduleId);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertModuleItemCvOwnership(input.id, ctx.session.user.id);
			return cvModuleItemService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertModuleItemCvOwnership(input.id, ctx.session.user.id);
			return cvModuleItemService.delete(input.id);
		}),
});
