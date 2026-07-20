import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import type { CreateCvPrizeDto, UpdateCvPrizeDto } from "../dto/CvPrizeDto";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";

export class CvPrizeService {
	async create(cvId: string, data: CreateCvPrizeDto) {
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

		const existingNetwork = await prisma.cvPrize.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingNetwork) {
			throw new ConflictError(
				"CV_PRIZE_ALREADY_EXISTS",
				"This prize already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvPrize.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_PRIZE_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cvPrize.create({
			data: {
				cvId,
				title: data.title,
				domaine: data.domaine,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvPrize.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvPrizeDto) {
		const existing = await prisma.cvPrize.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Prize", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvPrize.findFirst({
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
					"CV_PRIZE_ALREADY_EXISTS",
					"This prize already exists for this CV.",
				);
			}
		}

		return prisma.cvPrize.update({
			where: {
				id,
			},
			data,
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const prize = await prisma.cvPrize.findUnique({
			where: {
				id,
			},
		});

		if (!prize) {
			throw new NotFoundError("CV Prize", id);
		}

		if (prize.order === newOrder) {
			return prize;
		}

		return prisma.$transaction(async (tx) => {
			const prizes = await tx.cvPrize.findMany({
				where: {
					cvId: prize.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(prizes, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvPrize.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvPrize.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvPrize.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const prize = await prisma.cvPrize.findUnique({
			where: {
				id,
			},
		});

		if (!prize) {
			throw new NotFoundError("CV Prize", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvPrize.delete({
				where: {
					id,
				},
			});

			const prizes = await tx.cvPrize.findMany({
				where: {
					cvId: prize.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(prizes);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvPrize.update({
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
				await tx.cvPrize.update({
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

export const cvPrizeService = new CvPrizeService();
