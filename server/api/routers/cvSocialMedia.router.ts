import z from "zod";
import { cvSocialMediaService } from "../../../src/services/cv/cvSocialMediaService";
import {
	createSocialMediaSchema,
	updateSocialMediaSchema,
} from "../../../src/services/schemas/socialMedia.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertSocialMediaCvOwnership(
	socialMediaId: string,
	userId: string,
) {
	const socialMedia = await prisma.cvSocialMedia.findUnique({
		where: { id: socialMediaId },
		select: { id: true, cvId: true },
	});
	if (!socialMedia) {
		throw new NotFoundError("CV Social Media", socialMediaId);
	}
	await assertCvOwnership(socialMedia.cvId, userId);
	return socialMedia;
}

export const cvSocialMediaRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createSocialMediaSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvSocialMediaService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvSocialMediaService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateSocialMediaSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertSocialMediaCvOwnership(input.id, ctx.session.user.id);
			return cvSocialMediaService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertSocialMediaCvOwnership(input.id, ctx.session.user.id);
			return cvSocialMediaService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertSocialMediaCvOwnership(input.id, ctx.session.user.id);
			return cvSocialMediaService.delete(input.id);
		}),
});
