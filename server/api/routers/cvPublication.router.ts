import z from "zod";
import { cvPublicationService } from "../../../src/services/cv/cvPublicationService";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";
import {
	createPublicationSchema,
	updatePublicationSchema,
} from "../../../src/services/schemas/publication.schema";

async function assertPublicationCvOwnership(publicationId: string, userId: string) {
	const publication = await prisma.cvPublication.findUnique({
		where: { id: publicationId },
		select: { id: true, cvId: true },
	});
	if (!publication) {
		throw new NotFoundError("CV Publication", publicationId);
	}
	await assertCvOwnership(publication.cvId, userId);
	return publication;
}

export const cvPublicationRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createPublicationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPublicationService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvPublicationService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updatePublicationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertPublicationCvOwnership(input.id, ctx.session.user.id);
			return cvPublicationService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertPublicationCvOwnership(input.id, ctx.session.user.id);
			return cvPublicationService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertPublicationCvOwnership(input.id, ctx.session.user.id);
			return cvPublicationService.delete(input.id);
		}),
});
