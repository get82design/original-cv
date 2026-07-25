import z from "zod";
import { cvLanguageService } from "../../../src/services/cv/cvLanguageService";
import {
	createLanguageSchema,
	updateLanguageSchema,
} from "../../../src/services/schemas/language.schema";
import { assertCvOwnership } from "../helpers/assertCvOwnership";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../../../src/services/errors";

async function assertLanguageCvOwnership(languageId: string, userId: string) {
	const language = await prisma.cvLanguage.findUnique({
		where: { id: languageId },
		select: { id: true, cvId: true },
	});
	if (!language) {
		throw new NotFoundError("CV Language", languageId);
	}
	await assertCvOwnership(language.cvId, userId);
	return language;
}

export const cvLanguageRouter = router({
	create: protectedProcedure
		.input(z.object({ cvId: z.string(), data: createLanguageSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvLanguageService.create(input.cvId, input.data);
		}),

	findAllByCvId: protectedProcedure
		.input(z.object({ cvId: z.string() }))
		.query(async ({ input, ctx }) => {
			await assertCvOwnership(input.cvId, ctx.session.user.id);
			return cvLanguageService.findAllByCvId(input.cvId);
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), data: updateLanguageSchema }))
		.mutation(async ({ input, ctx }) => {
			await assertLanguageCvOwnership(input.id, ctx.session.user.id);
			return cvLanguageService.update(input.id, input.data);
		}),

	move: protectedProcedure
		.input(z.object({ id: z.string(), newOrder: z.number().int().min(1) }))
		.mutation(async ({ input, ctx }) => {
			await assertLanguageCvOwnership(input.id, ctx.session.user.id);
			return cvLanguageService.move(input.id, input.newOrder);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			await assertLanguageCvOwnership(input.id, ctx.session.user.id);
			return cvLanguageService.delete(input.id);
		}),
});
