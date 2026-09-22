import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreateStrengthInput, UpdateStrengthInput } from "../schemas/strength.schema";

export class CvStrengthService {
	async create(cvId: string, data: CreateStrengthInput) {
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

		const existingTitle = await prisma.cvStrength.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingTitle) {
			throw new ConflictError(
				"CV_STRENGTH_ALREADY_EXISTS",
				"This strength already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvStrength.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_STRENGTH_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cvStrength.create({
			data: {
				cvId,
				title: data.title,
				description: data.description ?? null,
				icon: data.icon ?? null,
				order: data.order ?? 0,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvStrength.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateStrengthInput) {
		const existing = await prisma.cvStrength.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Strength", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvStrength.findFirst({
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
					"CV_STRENGTH_ALREADY_EXISTS",
					"This strength already exists for this CV.",
				);
			}
		}

		return prisma.cvStrength.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.icon !== undefined ? { icon: data.icon } : {}),
				...(data.description !== undefined ? { description: data.description } : {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const strength = await prisma.cvStrength.findUnique({
			where: {
				id,
			},
		});

		if (!strength) {
			throw new NotFoundError("CV Strength", id);
		}

		if (strength.order === newOrder) {
			return strength;
		}

		return prisma.$transaction(async (tx) => {
			const strengths = await tx.cvStrength.findMany({
				where: {
					cvId: strength.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(strengths, id, newOrder);

			// On libère la contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvStrength.update({
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
				await tx.cvStrength.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvStrength.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const strength = await prisma.cvStrength.findUnique({
			where: {
				id,
			},
		});

		if (!strength) {
			throw new NotFoundError("CV Strength", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvStrength.delete({
				where: {
					id,
				},
			});

			const strengths = await tx.cvStrength.findMany({
				where: {
					cvId: strength.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(strengths);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvStrength.update({
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
				await tx.cvStrength.update({
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

export const cvStrengthService = new CvStrengthService();
