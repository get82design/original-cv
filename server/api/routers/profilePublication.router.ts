import z from "zod";
import { profilePublicationService } from "../../../src/services/profile/profilePublicationService";
import {
	createPublicationSchema,
	updatePublicationSchema,
} from "../../../src/services/schemas/publication.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertPublicationProfileOwnership(
	publicationId: string,
	userId: string,
) {
	const publication = await prisma.publication.findUnique({
		where: { id: publicationId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!publication) {
		throw new NotFoundError("Profile Publication", publicationId);
	}
	if (publication.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return publication;
}

export const profilePublicationRouter = router({
	create: protectedProcedure
		.input(createPublicationSchema)
		.mutation(async ({ input, ctx }) => {
			const profile = await getOwnedProfile(ctx.session.user.id);
			return profilePublicationService.create(profile.id, input);
		}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profilePublicationService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updatePublicationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertPublicationProfileOwnership(input.id, ctx.session.user.id);
			return profilePublicationService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertPublicationProfileOwnership(input.id, ctx.session.user.id);
			return profilePublicationService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertPublicationProfileOwnership(input.id, ctx.session.user.id);
			return profilePublicationService.delete(input.id);
		}),
});
