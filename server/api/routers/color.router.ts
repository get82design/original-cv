import z from "zod";
import { colorService } from "../../../src/services/commons/colorService";
import {
	colorSchema,
	moveColorSchema,
	updateColorSchema,
} from "../../../src/services/schemas/color.schema";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../trpc";

export const colorRouter = router({
	/** Catalogue couleurs — lecture publique (éditeur / create CV). */
	findAll: publicProcedure.query(async () => {
		return colorService.findAll();
	}),

	findById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		return colorService.findById(input.id);
	}),

	findByName: protectedProcedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
		return colorService.findByName(input.name);
	}),

	/** Écritures réservées ADMIN. */
	create: adminProcedure.input(colorSchema).mutation(async ({ input }) => {
		return colorService.create(input);
	}),

	update: adminProcedure
		.input(z.object({ id: z.string(), data: updateColorSchema }))
		.mutation(async ({ input }) => {
			return colorService.update(input.id, input.data);
		}),

	move: adminProcedure.input(moveColorSchema).mutation(async ({ input }) => {
		return colorService.move(input);
	}),

	delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
		return colorService.delete(input.id);
	}),
});
