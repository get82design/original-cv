import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type { CreateTagInput, UpdateTagInput } from "../schemas/tag.schema";

export class CvTagService {
	async create(groupId: string, data: CreateTagInput) {
		const group = await prisma.cvTagGroup.findUnique({
			where: {
				id: groupId,
			},
		});

		if (!group) {
			throw new NotFoundError("CV Tag Group", groupId);
		}

		const tag = await prisma.tag.findUnique({
			where: {
				id: data.tagId,
			},
		});

		if (!tag) {
			throw new NotFoundError("Tag", data.tagId);
		}

		const existingTagInGroup = await prisma.cvTag.findFirst({
			where: {
				groupId: groupId,
				tagId: data.tagId,
			},
		});

		if (existingTagInGroup) {
			throw new ConflictError("Tag already exists in group");
		}

		const existingOrder = await prisma.cvTag.findUnique({
			where: {
				groupId_order: {
					groupId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_TAG_ORDER_ALREADY_EXISTS",
				"This order is already used in this group.",
			);
		}

		return await prisma.cvTag.create({
			data: {
				groupId,
				tagId: data.tagId,
				order: data.order,
			},
		});
	}

	async findAllByGroupId(groupId: string) {
		return prisma.cvTag.findMany({
			where: {
				groupId,
			},
			include: {
				tag: true,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateTagInput) {
		const existing = await prisma.cvTag.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Tag", id);
		}

		if (data.tagId && data.tagId !== existing.tagId) {
			const tag = await prisma.tag.findUnique({
				where: {
					id: data.tagId,
				},
			});

			if (!tag) {
				throw new NotFoundError("Tag", data.tagId);
			}

			const duplicate = await prisma.cvTag.findUnique({
				where: {
					groupId_tagId: {
						groupId: existing.groupId,
						tagId: data.tagId,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_TAG_ALREADY_EXISTS",
					"This tag already exists in this group.",
				);
			}
		}

		return prisma.cvTag.update({
			where: {
				id,
			},
			data: {
				tagId: data.tagId ?? existing.tagId,
			},
			include: {
				tag: true,
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new ValidationError(
				"INVALID_ORDER",
				"Order must be greater than 0.",
			);
		}

		const tag = await prisma.cvTag.findUnique({
			where: {
				id,
			},
		});

		if (!tag) {
			throw new NotFoundError("CV Tag", id);
		}

		if (tag.order === newOrder) {
			return tag;
		}

		return prisma.$transaction(async (tx) => {
			const tags = await tx.cvTag.findMany({
				where: {
					groupId: tag.groupId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(tags, id, newOrder);

			// Libération des contraintes uniques
			for (const { item, order } of reordered) {
				await tx.cvTag.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			// Attribution des nouveaux ordres
			for (const { item, order } of reordered) {
				await tx.cvTag.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvTag.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const tag = await prisma.cvTag.findUnique({
			where: {
				id,
			},
		});

		if (!tag) {
			throw new NotFoundError("CV Tag", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvTag.delete({
				where: {
					id,
				},
			});

			const tags = await tx.cvTag.findMany({
				where: {
					groupId: tag.groupId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(tags);

			for (const { item, order } of reordered) {
				await tx.cvTag.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvTag.update({
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

export const cvTagService = new CvTagService();
