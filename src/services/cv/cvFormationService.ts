import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import type {
	CreateCvFormationDto,
	UpdateCvFormationDto,
} from "../dto/CvFormationDto";
import { ConflictError, NotFoundError } from "../errors";

export class CvFormationService {
	async create(cvId: string, data: CreateCvFormationDto) {
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

		const existingFormation = await prisma.cvFormation.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingFormation) {
			throw new ConflictError(
				"CV_FORMATION_ALREADY_EXISTS",
				"This formation already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvFormation.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_FORMATION_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		validateTimeline(data.start, data.end, data.status);

		return prisma.cvFormation.create({
			data: {
				cvId,
				title: data.title,
				start: data.start,
				end: data.end ?? null,
				status: data.status ?? null,
				order: data.order,
				organismeFormation: data.organismeFormation ?? null,
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvFormation.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvFormationDto) {
		const existing = await prisma.cvFormation.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Formation", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvFormation.findFirst({
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
					"CV_FORMATION_ALREADY_EXISTS",
					"This formation already exists for this CV.",
				);
			}
		}

		validateTimeline(
			data.start ?? existing.start,
			data.end !== undefined ? data.end : existing.end,
			data.status !== undefined ? data.status : existing.status,
		);

		const dataToUpdate = {
			title: data.title ?? existing.title,
			organismeFormation:
				data.organismeFormation ?? existing.organismeFormation,
			start: data.start ?? existing.start,
			end: data.end !== undefined ? data.end : existing.end,
			status: data.status !== undefined ? data.status : existing.status,
		};

		return prisma.cvFormation.update({
			where: {
				id,
			},
			data: dataToUpdate,
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const formation = await prisma.cvFormation.findUnique({
			where: {
				id,
			},
		});

		if (!formation) {
			throw new NotFoundError("CV Formation", id);
		}

		if (formation.order === newOrder) {
			return formation;
		}

		return prisma.$transaction(async (tx) => {
			const formations = await tx.cvFormation.findMany({
				where: {
					cvId: formation.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(formations, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvFormation.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvFormation.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvFormation.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const formation = await prisma.cvFormation.findUnique({
			where: {
				id,
			},
		});

		if (!formation) {
			throw new NotFoundError("CV Formation", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvFormation.delete({
				where: {
					id,
				},
			});

			const formations = await tx.cvFormation.findMany({
				where: {
					cvId: formation.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(formations);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvFormation.update({
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
				await tx.cvFormation.update({
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

export const cvFormationService = new CvFormationService();
