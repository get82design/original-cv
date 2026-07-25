import z from "zod";
import { cvHeaderService } from "../../../src/services/cv/cvHeaderService";
import {
	createCvHeaderSchema,
	updateCvHeaderSchema,
} from "../../../src/services/schemas/cvHeader.schema";
import { assertCvOwnership } from "./../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";

export const cvHeaderRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createCvHeaderSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvHeaderService.create(input.cvId, input.data);
		}),

	byCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvHeaderService.findByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ cvId: z.string(), data: updateCvHeaderSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvHeaderService.update(input.cvId, input.data);
		}),

	delete: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvHeaderService.delete(input.cvId);
		}),
});
