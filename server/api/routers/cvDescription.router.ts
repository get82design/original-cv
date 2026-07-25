import z from "zod";
import {
	createDescriptionSchema,
	updateDescriptionSchema,
} from "../../../src/services/schemas/description.schema";
import { protectedProcedure, router } from "../trpc";
import { cvDescriptionService } from "../../../src/services/cv/cvDescriptionService";
import { assertCvOwnership } from "../helpers/assertCvOwnership";

export const cvDescriptionRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createDescriptionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvDescriptionService.create(input.cvId, input.data);
		}),

	byCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvDescriptionService.findByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ cvId: z.string(), data: updateDescriptionSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvDescriptionService.update(input.cvId, input.data);
		}),

	delete: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvDescriptionService.delete(input.cvId);
		}),
});
