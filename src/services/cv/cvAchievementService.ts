import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import type {
	CreateAchievementInput,
	UpdateAchievementInput,
} from "../schemas/achievement.schema";

export class CvAchievementService {
	async create(cvId: string, data: CreateAchievementInput) {
		const cv = await prisma.cV.findUnique({
			where: {
				id: cvId,
			},
			select: {
				id: true,
			},
		});

		if (!cv) {
			throw new NotFoundError("CV", cvId);
		}

		const existingAchievement = await prisma.cvAchievement.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingAchievement) {
			throw new ConflictError(
				"CV_ACHIEVEMENT_ALREADY_EXISTS",
				"This achievement already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvAchievement.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_ACHIEVEMENT_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cvAchievement.create({
			data: {
				cvId,
				title: data.title,
				description: data.description ?? null,
				year: data.year ?? null,
				technology: data.technology ?? null,
				order: data.order ?? 0,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvAchievement.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateAchievementInput) {
		const existing = await prisma.cvAchievement.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Achievement", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvAchievement.findFirst({
				where: {
					cvId: existing.cvId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_ACHIEVEMENT_ALREADY_EXISTS",
					"This achievement already exists for this CV.",
				);
			}
		}

		return prisma.cvAchievement.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.description !== undefined
					? { description: data.description }
					: {}),
				...(data.year !== undefined ? { year: data.year } : {}),
				...(data.technology !== undefined
					? { technology: data.technology }
					: {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const achievement = await prisma.cvAchievement.findUnique({
			where: {
				id,
			},
		});

		if (!achievement) {
			throw new NotFoundError("CV Achievement", id);
		}

		if (achievement.order === newOrder) {
			return achievement;
		}

		return prisma.$transaction(async (tx) => {
			const achievements = await tx.cvAchievement.findMany({
				where: {
					cvId: achievement.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(achievements, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvAchievement.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvAchievement.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvAchievement.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const achievement = await prisma.cvAchievement.findUnique({
			where: {
				id,
			},
		});

		if (!achievement) {
			throw new NotFoundError("CV Achievement", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvAchievement.delete({
				where: {
					id,
				},
			});

			const achievements = await tx.cvAchievement.findMany({
				where: {
					cvId: achievement.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(achievements);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvAchievement.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			// nouveaux ordres
			for (const { item, order } of reordered) {
				await tx.cvAchievement.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}
		});
	}
}

export const cvAchievementService = new CvAchievementService();
