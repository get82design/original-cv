import z from "zod";
import { profileCertificationService } from "../../../src/services/profile/profileCertificationService";
import {
	createCertificationSchema,
	updateCertificationSchema,
} from "../../../src/services/schemas/certification.schema";
import { getOwnedProfile } from "../helpers/getOwnedProfile";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError } from "../../../src/services/errors";

async function assertCertificationProfileOwnership(
	certificationId: string,
	userId: string,
) {
	const certification = await prisma.certification.findUnique({
		where: { id: certificationId },
		select: {
			id: true,
			profileId: true,
			profile: { select: { userId: true } },
		},
	});
	if (!certification) {
		throw new NotFoundError("Profile Certification", certificationId);
	}
	if (certification.profile.userId !== userId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
	return certification;
}

export const profileCertificationRouter = router({
	create: protectedProcedure
		.input(createCertificationSchema)
		.mutation(async ({ input, ctx }) => {
			const profile = await getOwnedProfile(ctx.session.user.id);
			return profileCertificationService.create(profile.id, input);
		}),

	findAll: protectedProcedure.query(async ({ ctx }) => {
		const profile = await getOwnedProfile(ctx.session.user.id);
		return profileCertificationService.findAllByProfileId(profile.id);
	}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCertificationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCertificationProfileOwnership(input.id, ctx.session.user.id);
			return profileCertificationService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertCertificationProfileOwnership(input.id, ctx.session.user.id);
			return profileCertificationService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCertificationProfileOwnership(input.id, ctx.session.user.id);
			return profileCertificationService.delete(input.id);
		}),
});
