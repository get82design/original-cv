import z from "zod";
import { profileLanguageService } from "../../../src/services/profile/profileLanguageService";
import {
	createLanguageSchema,
	updateLanguageSchema,
} from "../../../src/services/schemas/language.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertLanguageProfileOwnership(languageId: string, userId: string) {
	const language = await prisma.language.findUnique({
		where: { id: languageId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!language) {
		throw new NotFoundError("Profile Language", languageId);
	}
	if (language.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return language;
}

export const profileLanguageRouter = router({
	create: protectedProcedure.input(createLanguageSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileLanguageService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileLanguageService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateLanguageSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertLanguageProfileOwnership(input.id, ctx.session.user.id);
			return profileLanguageService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertLanguageProfileOwnership(input.id, ctx.session.user.id);
			return profileLanguageService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertLanguageProfileOwnership(input.id, ctx.session.user.id);
			return profileLanguageService.delete(input.id);
		}),
});
