import z from "zod";
import { colorService } from "../../../src/services/commons/colorService";
import { colorSchema, updateColorSchema } from "../../../src/services/schemas/color.schema";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const colorRouter = router({
	create: protectedProcedure.input(colorSchema).mutation(async ({ input }) => {
		return colorService.create(input);
	}),

	findAll: publicProcedure.query(async () => {
		return colorService.findAll();
	}),

	findById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		return colorService.findById(input.id);
	}),

	findByName: protectedProcedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
		return colorService.findByName(input.name);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateColorSchema }))
		.mutation(async ({ input }) => {
			return colorService.update(input.id, input.data);
		}),

	delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
		return colorService.delete(input.id);
	}),
});
