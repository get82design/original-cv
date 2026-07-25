import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import type {
	CreateAchievementInput,
	UpdateAchievementInput,
} from "../schemas/achievement.schema";

export class ProfileAchievementService {
	async create(profileId: string, data: CreateAchievementInput) {
		const profile = await prisma.profile.findUnique({
			where: {
				id: profileId,
			},
			select: {
				id: true,
			},
		});

		if (!profile) {
			throw new NotFoundError("Profile", profileId);
		}

		const existingAchievement = await prisma.achievement.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingAchievement) {
			throw new ConflictError(
				"PROFILE_ACHIEVEMENT_ALREADY_EXISTS",
				"This achievement already exists for this profile.",
			);
		}

		const existingOrder = await prisma.achievement.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_ACHIEVEMENT_ORDER_ALREADY_EXISTS",
				"This order is already used for this profile.",
			);
		}

		return prisma.achievement.create({
			data: {
				profileId,
				title: data.title,
				description: data.description ?? null,
				year: data.year ?? null,
				technology: data.technology ?? null,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.achievement.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateAchievementInput) {
		const existing = await prisma.achievement.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Achievement", id);
		}

		if (data.title) {
			const duplicate = await prisma.achievement.findFirst({
				where: {
					profileId: existing.profileId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"PROFILE_ACHIEVEMENT_ALREADY_EXISTS",
					"This achievement already exists for this profile.",
				);
			}
		}

		return prisma.achievement.update({
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
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const achievement = await prisma.achievement.findUnique({
			where: {
				id,
			},
		});

		if (!achievement) {
			throw new NotFoundError("Profile Achievement", id);
		}

		if (achievement.order === newOrder) {
			return achievement;
		}

		return prisma.$transaction(async (tx) => {
			const achievements = await tx.achievement.findMany({
				where: {
					profileId: achievement.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(achievements, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.achievement.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.achievement.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.achievement.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const achievement = await prisma.achievement.findUnique({
			where: {
				id,
			},
		});

		if (!achievement) {
			throw new NotFoundError("Profile Achievement", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.achievement.delete({
				where: {
					id,
				},
			});

			const achievements = await tx.achievement.findMany({
				where: {
					profileId: achievement.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(achievements);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.achievement.update({
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
				await tx.achievement.update({
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

export const profileAchievementService = new ProfileAchievementService();
