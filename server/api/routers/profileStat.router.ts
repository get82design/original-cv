import z from "zod";
import { profileStatService } from "../../../src/services/profile/profileStatService";
import { createStatSchema, updateStatSchema } from "../../../src/services/schemas/stat.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertStatProfileOwnership(statId: string, userId: string) {
	const stat = await prisma.stat.findUnique({
		where: { id: statId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!stat) {
		throw new NotFoundError("Profile Stat", statId);
	}
	if (stat.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return stat;
}

export const profileStatRouter = router({
	create: protectedProcedure.input(createStatSchema).mutation(async ({ input, ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileStatService.create(profile.id, input);
	}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileStatService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateStatSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertStatProfileOwnership(input.id, ctx.session.user.id);
			return profileStatService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertStatProfileOwnership(input.id, ctx.session.user.id);
			return profileStatService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertStatProfileOwnership(input.id, ctx.session.user.id);
			return profileStatService.delete(input.id);
		}),
});
