import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";

export class UnlockedTemplateService {
	async unlockTemplate(userId: string, templateId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundError("USER", userId);
		}

		const template = await prisma.cVTemplate.findUnique({
			where: { id: templateId },
			select: { id: true },
		});

		if (!template) {
			throw new NotFoundError("CV_TEMPLATE", templateId);
		}

		const existing = await prisma.unlockedTemplate.findUnique({
			where: {
				userId_templateId: {
					userId,
					templateId,
				},
			},
		});

		if (existing) {
			throw new ConflictError(
				"TEMPLATE_ALREADY_UNLOCKED",
				"Template already unlocked",
			);
		}

		return prisma.unlockedTemplate.create({
			data: {
				userId,
				templateId,
			},
			include: {
				template: true,
			},
		});
	}

	async findAllByUser(userId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundError("USER", userId);
		}

		return prisma.unlockedTemplate.findMany({
			where: {
				userId,
			},
			include: {
				template: true,
			},
			orderBy: {
				unlockedAt: "desc",
			},
		});
	}

	async hasUnlocked(userId: string, templateId: string) {
		const unlocked = await prisma.unlockedTemplate.findUnique({
			where: {
				userId_templateId: {
					userId,
					templateId,
				},
			},
		});

		return unlocked !== null;
	}

	async delete(userId: string, templateId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundError("USER", userId);
		}

		const unlocked = await prisma.unlockedTemplate.findUnique({
			where: {
				userId_templateId: {
					userId,
					templateId,
				},
			},
		});

		if (!unlocked) {
			throw new NotFoundError("UNLOCKED_TEMPLATE", `${userId}-${templateId}`);
		}

		return prisma.unlockedTemplate.delete({
			where: {
				userId_templateId: {
					userId,
					templateId,
				},
			},
		});
	}

	async unlockManyTemplates(userId: string, templateIds: string[]) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});
		if (!user) {
			throw new NotFoundError("USER", userId);
		}
		const templates = await prisma.cVTemplate.findMany({
			where: {
				id: {
					in: templateIds,
				},
			},
			select: { id: true },
		});
		if (templates.length !== templateIds.length) {
			throw new NotFoundError(
				"CV_TEMPLATE",
				templateIds
					.filter(
						(templateId) =>
							!templates.some((template) => template.id === templateId),
					)
					.join(","),
			);
		}
		return prisma.unlockedTemplate.createMany({
			data: templateIds.map((templateId) => ({
				userId,
				templateId,
			})),
			skipDuplicates: true,
		});
	}
}

export const unlockedTemplateService = new UnlockedTemplateService();
