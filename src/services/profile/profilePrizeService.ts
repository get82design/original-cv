import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreatePrizeInput, UpdatePrizeInput } from "../schemas/prize.schema";

export class ProfilePrizeService {
	async create(profileId: string, data: CreatePrizeInput) {
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

		const existingPrize = await prisma.prize.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingPrize) {
			throw new ConflictError(
				"PROFILE_PRIZE_ALREADY_EXISTS",
				"This prize already exists for this Profile.",
			);
		}

		const existingOrder = await prisma.prize.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_PRIZE_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		return prisma.prize.create({
			data: {
				profileId,
				title: data.title,
				domaine: data.domaine,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.prize.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdatePrizeInput) {
		const existing = await prisma.prize.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Prize", id);
		}

		if (data.title) {
			const duplicate = await prisma.prize.findFirst({
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
					"PROFILE_PRIZE_ALREADY_EXISTS",
					"This prize already exists for this Profile.",
				);
			}
		}

		return prisma.prize.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.domaine !== undefined ? { domaine: data.domaine } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const prize = await prisma.prize.findUnique({
			where: {
				id,
			},
		});

		if (!prize) {
			throw new NotFoundError("Profile Prize", id);
		}

		if (prize.order === newOrder) {
			return prize;
		}

		return prisma.$transaction(async (tx) => {
			const prizes = await tx.prize.findMany({
				where: {
					profileId: prize.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(prizes, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.prize.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.prize.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.prize.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const prize = await prisma.prize.findUnique({
			where: {
				id,
			},
		});

		if (!prize) {
			throw new NotFoundError("Profile Prize", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.prize.delete({
				where: {
					id,
				},
			});

			const prizes = await tx.prize.findMany({
				where: {
					profileId: prize.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(prizes);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.prize.update({
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
				await tx.prize.update({
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

export const profilePrizeService = new ProfilePrizeService();
