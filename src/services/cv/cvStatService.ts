import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreateStatInput, UpdateStatInput } from "../schemas/stat.schema";

export class CvStatService {
	async create(cvId: string, data: CreateStatInput) {
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

		const existingLabel = await prisma.cvStat.findUnique({
			where: {
				cvId_label: {
					cvId,
					label: data.label,
				},
			},
		});

		if (existingLabel) {
			throw new ConflictError(
				"CV_STAT_ALREADY_EXISTS",
				"Cette statistique existe déjà pour ce CV.",
			);
		}

		const existingOrder = await prisma.cvStat.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_STAT_ORDER_ALREADY_EXISTS",
				"Cet ordre est déjà utilisé pour ce CV.",
			);
		}

		return prisma.cvStat.create({
			data: {
				cvId,
				label: data.label,
				value: data.value,
				order: data.order ?? 0,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvStat.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateStatInput) {
		const existing = await prisma.cvStat.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Stat", id);
		}

		if (data.label) {
			const duplicate = await prisma.cvStat.findFirst({
				where: {
					cvId: existing.cvId,
					label: data.label,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_STAT_ALREADY_EXISTS",
					"Cette statistique existe déjà pour ce CV.",
				);
			}
		}

		return prisma.cvStat.update({
			where: {
				id,
			},
			data: {
				...(data.label !== undefined ? { label: data.label } : {}),
				...(data.value !== undefined ? { value: data.value } : {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const stat = await prisma.cvStat.findUnique({
			where: {
				id,
			},
		});

		if (!stat) {
			throw new NotFoundError("CV Stat", id);
		}

		if (stat.order === newOrder) {
			return stat;
		}

		return prisma.$transaction(async (tx) => {
			const stats = await tx.cvStat.findMany({
				where: {
					cvId: stat.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(stats, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvStat.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvStat.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvStat.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const stat = await prisma.cvStat.findUnique({
			where: {
				id,
			},
		});

		if (!stat) {
			throw new NotFoundError("CV Stat", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvStat.delete({
				where: {
					id,
				},
			});

			const stats = await tx.cvStat.findMany({
				where: {
					cvId: stat.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(stats);

			for (const { item, order } of reordered) {
				await tx.cvStat.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvStat.update({
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

export const cvStatService = new CvStatService();
