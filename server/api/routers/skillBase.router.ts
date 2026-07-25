import z from "zod";
import { skillService } from "../../../src/services/commons/skillService";
import {
	createSkillBaseSchema,
	updateSkillBaseSchema,
} from "../../../src/services/schemas/skillBase.schema";
import { protectedProcedure, router } from "../trpc";

export const skillBaseRouter = router({
	create: protectedProcedure
		.input(createSkillBaseSchema)
		.mutation(async ({ input }) => {
			return skillService.create(input);
		}),
	findAll: protectedProcedure.query(async () => {
		return skillService.findAll();
	}),
	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateSkillBaseSchema }))
		.mutation(async ({ input }) => {
			return skillService.update(input.id, input.data);
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			return skillService.delete(input.id);
		}),
});
