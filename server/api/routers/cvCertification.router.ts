import z from "zod";
import { cvCertificationService } from "../../../src/services/cv/cvCertificationService";
import {
	createCertificationSchema,
	updateCertificationSchema,
} from "../../../src/services/schemas/certification.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertCertificationCvOwnership(certificationId: string, userId: string) {
	const certification = await prisma.cvCertification.findUnique({
		where: { id: certificationId },
		select: { id: true, cvId: true },
	});
	if (!certification) {
		throw new NotFoundError("CV Certification", certificationId);
	}
	await assertCvOwnership(certification.cvId, userId);
	return certification;
}

export const cvCertificationRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createCertificationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvCertificationService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvCertificationService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateCertificationSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCertificationCvOwnership(input.id, ctx.session.user.id);
			return cvCertificationService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertCertificationCvOwnership(input.id, ctx.session.user.id);
			return cvCertificationService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertCertificationCvOwnership(input.id, ctx.session.user.id);
			return cvCertificationService.delete(input.id);
		}),
});
