import z from "zod";
import { cvTemplateService } from "../../../src/services/cv/cvTemplateService";
import { createCvTemplateSchema } from "../../../src/services/schemas/cvTemplate.schema";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const cvTemplateRouter = router({
	create: protectedProcedure
		.input(createCvTemplateSchema)
		.mutation(async ({ input }) => {
			return cvTemplateService.create(input);
		}),

	findById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return cvTemplateService.findById(input.id);
		}),

	findAll: publicProcedure.query(async () => {
		return cvTemplateService.findAll();
	}),
});
