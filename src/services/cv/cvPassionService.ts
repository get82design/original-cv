import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreatePassionInput, UpdatePassionInput } from "../schemas/passion.schema";

export class CvPassionService {
	async create(cvId: string, data: CreatePassionInput) {
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

		const existing = await prisma.cvPassion.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existing) {
			throw new ConflictError(
				"CV_PASSION_ALREADY_EXISTS",
				"This Passion already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvPassion.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_PASSION_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cvPassion.create({
			data: {
				cvId,
				title: data.title,
				icon: data.icon,
				order: data.order ?? 0,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvPassion.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdatePassionInput) {
		const passion = await prisma.cvPassion.findUnique({
			where: {
				id,
			},
		});

		if (!passion) {
			throw new NotFoundError("CV Passion", id);
		}

		if (data.title) {
			const existing = await prisma.cvPassion.findFirst({
				where: {
					cvId: passion.cvId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (existing) {
				throw new ConflictError(
					"CV_PASSION_ALREADY_EXISTS",
					"This passion already exists for this CV.",
				);
			}
		}

		return prisma.cvPassion.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.icon !== undefined ? { icon: data.icon } : {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const passion = await prisma.cvPassion.findUnique({
			where: {
				id,
			},
		});

		if (!passion) {
			throw new NotFoundError("CV Passion", id);
		}

		if (passion.order === newOrder) {
			return passion;
		}

		return prisma.$transaction(async (tx) => {
			const passions = await tx.cvPassion.findMany({
				where: {
					cvId: passion.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(passions, id, newOrder);

			// On libère la contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvPassion.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			// On applique les nouveaux ordres
			for (const { item, order } of reordered) {
				await tx.cvPassion.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvPassion.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const passion = await prisma.cvPassion.findUnique({
			where: {
				id,
			},
		});

		if (!passion) {
			throw new NotFoundError("CV Passion", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvPassion.delete({
				where: {
					id,
				},
			});

			const passions = await tx.cvPassion.findMany({
				where: {
					cvId: passion.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const compacted = compactOrder(passions);

			for (const { item, order } of compacted) {
				await tx.cvPassion.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of compacted) {
				await tx.cvPassion.update({
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

export const cvPassionService = new CvPassionService();
