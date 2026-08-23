import z from "zod";
import { tagService } from "../../../src/services/commons/tagService";
import {
	createTagSourceSchema,
	updateTagSourceSchema,
} from "../../../src/services/schemas/tagSource.schema";
import { protectedProcedure, router } from "../trpc";

export const tagBaseRouter = router({
	create: protectedProcedure
		.input(createTagSourceSchema)
		.mutation(async ({ input }) => {
			return tagService.create(input);
		}),
	findAll: protectedProcedure.query(async () => {
		return tagService.findAll();
	}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateTagSourceSchema }))
		.mutation(async ({ input }) => {
			return tagService.update(input.id, input.data);
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			return tagService.delete(input.id);
		}),
});
