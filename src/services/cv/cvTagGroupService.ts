import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type {
	CreateTagGroupInput,
	UpdateTagGroupInput,
} from "../schemas/tagGroup.schema";

export class CvTagGroupService {
	async create(cvId: string, data: CreateTagGroupInput) {
		const existingCv = await prisma.cV.findUnique({
			where: {
				id: cvId,
			},
			select: {
				id: true,
			},
		});

		if (!existingCv) {
			throw new NotFoundError("CV", cvId);
		}

		if (data.title) {
			const existingGroup = await prisma.cvTagGroup.findFirst({
				where: {
					cvId: cvId,
					title: data.title,
				},
			});

			if (existingGroup) {
				throw new ConflictError("CV Tag Group already exists");
			}
		}

		const existingOrder = await prisma.cvTagGroup.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_TAG_GROUP_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return await prisma.cvTagGroup.create({
			data: {
				title: data.title,
				order: data.order,
				cvId: cvId,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return await prisma.cvTagGroup.findMany({
			where: {
				cvId: cvId,
			},
			include: {
				tags: {
					include: {
						tag: true,
					},
				},
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateTagGroupInput) {
		const existing = await prisma.cvTagGroup.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Tag Group", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvTagGroup.findFirst({
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
					"CV_TAG_GROUP_ALREADY_EXISTS",
					"This tag group already exists for this CV.",
				);
			}
		}

		return await prisma.cvTagGroup.update({
			where: {
				id: id,
			},
			data: {
				title: data.title ?? existing.title,
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new ValidationError("Invalid order");
		}

		const tagGroup = await prisma.cvTagGroup.findUnique({
			where: {
				id,
			},
		});

		if (!tagGroup) {
			throw new NotFoundError("CV Tag Group", id);
		}

		if (tagGroup.order === newOrder) {
			return tagGroup;
		}

		return prisma.$transaction(async (tx) => {
			const tagGroups = await tx.cvTagGroup.findMany({
				where: {
					cvId: tagGroup.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(tagGroups, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvTagGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvTagGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvTagGroup.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const tagGroup = await prisma.cvTagGroup.findUnique({
			where: {
				id,
			},
		});

		if (!tagGroup) {
			throw new NotFoundError("CV Tag Group", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvTagGroup.delete({
				where: {
					id,
				},
			});

			const tagGroups = await tx.cvTagGroup.findMany({
				where: {
					cvId: tagGroup.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(tagGroups);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvTagGroup.update({
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
				await tx.cvTagGroup.update({
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

export const cvTagGroupService = new CvTagGroupService();
