import z from "zod";
import { competenceService } from "../../../src/services/commons/competenceService";
import {
	createCompetenceSourceSchema,
	updateCompetenceSourceSchema,
} from "../../../src/services/schemas/competenceSource.schema";
import { protectedProcedure, router } from "../trpc";

export const competenceBaseRouter = router({
	create: protectedProcedure.input(createCompetenceSourceSchema).mutation(async ({ input }) => {
		return competenceService.create(input);
	}),
	findAll: protectedProcedure.query(async () => {
		return competenceService.findAll();
	}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCompetenceSourceSchema }))
		.mutation(async ({ input }) => {
			return competenceService.update(input.id, input.data);
		}),
	delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
		return competenceService.delete(input.id);
	}),
});
