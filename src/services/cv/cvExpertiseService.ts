import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreateExpertiseInput, UpdateExpertiseInput } from "../schemas/expertise.schema";

export class CvExpertiseService {
	async create(cvId: string, data: CreateExpertiseInput) {
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

		const existing = await prisma.cvExpertise.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existing) {
			throw new ConflictError(
				"CV_EXPERTISE_ALREADY_EXISTS",
				"This Expertise already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvExpertise.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_EXPERTISE_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cvExpertise.create({
			data: {
				cvId,
				title: data.title,
				level: data.level,
				order: data.order ?? 0,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvExpertise.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateExpertiseInput) {
		const existing = await prisma.cvExpertise.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Expertise", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvExpertise.findFirst({
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
					"CV_EXPERTISE_ALREADY_EXISTS",
					"This expertise already exists for this CV.",
				);
			}
		}

		return prisma.cvExpertise.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.level !== undefined ? { level: data.level } : {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const expertise = await prisma.cvExpertise.findUnique({
			where: {
				id,
			},
		});

		if (!expertise) {
			throw new NotFoundError("CV Expertise", id);
		}

		if (expertise.order === newOrder) {
			return expertise;
		}

		return prisma.$transaction(async (tx) => {
			const expertises = await tx.cvExpertise.findMany({
				where: {
					cvId: expertise.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(expertises, id, newOrder);

			// 1) Libère les contraintes uniques
			for (const { item, order } of reordered) {
				await tx.cvExpertise.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			// 2) Applique les nouveaux ordres
			for (const { item, order } of reordered) {
				await tx.cvExpertise.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvExpertise.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const expertise = await prisma.cvExpertise.findUnique({
			where: {
				id,
			},
		});

		if (!expertise) {
			throw new NotFoundError("CV Expertise", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvExpertise.delete({
				where: {
					id,
				},
			});

			const expertises = await tx.cvExpertise.findMany({
				where: {
					cvId: expertise.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(expertises);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvExpertise.update({
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
				await tx.cvExpertise.update({
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

export const cvExpertiseService = new CvExpertiseService();
