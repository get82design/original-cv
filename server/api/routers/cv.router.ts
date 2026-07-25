import z from "zod";
import { cvService } from "../../../src/services/cv/cvService";
import { protectedProcedure, router } from "../trpc";
import {
	createCvInputSchema,
	updateCvInputSchema,
} from "../../../src/services/schemas/cv.schema";
import { ForbiddenError } from "../../../src/services/errors";
import { cvSaveService } from "../../../src/services/cv/cvSaveService";
import { cvSaveSchema } from "../../../src/services/schemas/cvSave.schema";

export const cvRouter = router({
	create: protectedProcedure
		.input(createCvInputSchema)
		.mutation(({ input, ctx }) =>
			cvService.create({ ...input, userId: ctx.session.user.id }),
		),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const cv = await cvService.findById(input.id);
			if (cv.userId !== ctx.session.user.id) {
				throw new ForbiddenError("You cannot access this CV");
			}
			return cv;
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCvInputSchema }))
		.mutation(({ input, ctx }) =>
			cvService.update(input.id, ctx.session.user.id, input.data),
		),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input, ctx }) =>
			cvService.delete(input.id, ctx.session.user.id),
		),

	allByUser: protectedProcedure.query(({ ctx }) =>
			cvService.findAllByUser(ctx.session.user.id),
		),

	save: protectedProcedure
		.input(cvSaveSchema)
		.mutation(({ input, ctx }) =>
			cvSaveService.save(ctx.session.user.id, input),
		),
});
