import z from "zod";
import { cvTemplateService } from "../../../src/services/cv/cvTemplateService";
import { createCvTemplateSchema } from "../../../src/services/schemas/cvTemplate.schema";
import { protectedProcedure, router } from "../trpc";

export const cvTemplateRouter = router({
	create: protectedProcedure
		.input(createCvTemplateSchema)
		.mutation(async ({ input }) => {
			return cvTemplateService.create(input);
		}),

	findById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return cvTemplateService.findById(input.id);
		}),

	findAll: protectedProcedure.query(async () => {
		return cvTemplateService.findAll();
	}),
});
