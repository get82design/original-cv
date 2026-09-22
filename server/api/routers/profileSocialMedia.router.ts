import z from "zod";
import { profileSocialMediaService } from "../../../src/services/profile/profileSocialMediaService";
import {
	createSocialMediaSchema,
	updateSocialMediaSchema,
} from "../../../src/services/schemas/socialMedia.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertSocialMediaProfileOwnership(socialMediaId: string, userId: string) {
	const socialMedia = await prisma.socialMedia.findUnique({
		where: { id: socialMediaId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!socialMedia) {
		throw new NotFoundError("Profile Social Media", socialMediaId);
	}
	if (socialMedia.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return socialMedia;
}

export const profileSocialMediaRouter = router({
	create: protectedProcedure.input(createSocialMediaSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileSocialMediaService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileSocialMediaService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateSocialMediaSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertSocialMediaProfileOwnership(input.id, ctx.session.user.id);
			return profileSocialMediaService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertSocialMediaProfileOwnership(input.id, ctx.session.user.id);
			return profileSocialMediaService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertSocialMediaProfileOwnership(input.id, ctx.session.user.id);
			return profileSocialMediaService.delete(input.id);
		}),
});
