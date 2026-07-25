import z from "zod";
import { cvVolunteeringService } from "../../../src/services/cv/cvVolunteeringService";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";
import {
	createVolunteeringSchema,
	updateVolunteeringSchema,
} from "../../../src/services/schemas/volunteering.schema";

async function assertVolunteeringCvOwnership(
	volunteeringId: string,
	userId: string,
) {
	const volunteering = await prisma.cvVolunteering.findUnique({
		where: { id: volunteeringId },
		select: { id: true, cvId: true },
	});
	if (!volunteering) {
		throw new NotFoundError("CV Volunteering", volunteeringId);
	}
	await assertCvOwnership(volunteering.cvId, userId);
	return volunteering;
}

export const cvVolunteeringRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createVolunteeringSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvVolunteeringService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvVolunteeringService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateVolunteeringSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertVolunteeringCvOwnership(input.id, ctx.session.user.id);
			return cvVolunteeringService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertVolunteeringCvOwnership(input.id, ctx.session.user.id);
			return cvVolunteeringService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertVolunteeringCvOwnership(input.id, ctx.session.user.id);
			return cvVolunteeringService.delete(input.id);
		}),
});
