import z from "zod";
import { unlockedTemplateService } from "../../../src/services/commons/unlockedTemplateService";
import { protectedProcedure, router } from "../trpc";

export const unlockedTemplateRouter = router({
	unlock: protectedProcedure
		.input(z.object({ templateId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			return unlockedTemplateService.unlockTemplate(
				ctx.session.user.id,
				input.templateId,
			);
		}),

	unlockMany: protectedProcedure
		.input(z.object({ templateIds: z.array(z.string()).min(1) }))
		.mutation(async ({ input, ctx }) => {
			return unlockedTemplateService.unlockManyTemplates(
				ctx.session.user.id,
				input.templateIds,
			);
		}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		return unlockedTemplateService.findAllByUser(ctx.session.user.id);
	}),

	hasUnlocked: protectedProcedure
		.input(z.object({ templateId: z.string() }))
		.query(async ({ input, ctx }) => {
			return unlockedTemplateService.hasUnlocked(
				ctx.session.user.id,
				input.templateId,
			);
		}),

	delete: protectedProcedure
		.input(z.object({ templateId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			return unlockedTemplateService.delete(
				ctx.session.user.id,
				input.templateId,
			);
		}),
});