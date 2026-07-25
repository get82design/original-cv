import { protectedProcedure, router } from "../trpc";
import z from "zod";
import {
	createPhilosophySchema,
	updatePhilosophySchema,
} from "../../../src/services/schemas/philosophy.schema";
import { cvPhilosophyService } from "../../../src/services/cv/cvPhilosophyService";
import { assertCvOwnership } from "../helpers/assertCvOwnership";

export const cvPhilosophyRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createPhilosophySchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPhilosophyService.create(input.cvId, input.data);
		}),

	byCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPhilosophyService.findByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ cvId: z.string(), data: updatePhilosophySchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPhilosophyService.update(input.cvId, input.data);
		}),

	delete: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPhilosophyService.delete(input.cvId);
		}),
});
