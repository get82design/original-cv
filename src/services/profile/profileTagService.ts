import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import type { CreateTagInput, UpdateTagInput } from "../schemas/tag.schema";
import { ConflictError, NotFoundError, ValidationError } from "../errors";

export class ProfileTagService {
	async create(groupId: string, data: CreateTagInput) {
		const group = await prisma.profileTagGroup.findUnique({
			where: {
				id: groupId,
			},
		});

		if (!group) {
			throw new NotFoundError("Profile Tag Group", groupId);
		}

		const tag = await prisma.tag.findUnique({
			where: {
				id: data.tagId,
			},
		});

		if (!tag) {
			throw new NotFoundError("Tag", data.tagId);
		}

		const existingTagInGroup = await prisma.profileTag.findFirst({
			where: {
				groupId: groupId,
				tagId: data.tagId,
			},
		});

		if (existingTagInGroup) {
			throw new ConflictError("Tag already exists in group");
		}

		const existingOrder = await prisma.profileTag.findUnique({
			where: {
				groupId_order: {
					groupId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_TAG_ORDER_ALREADY_EXISTS",
				"This order is already used in this group.",
			);
		}

		return await prisma.profileTag.create({
			data: {
				groupId,
				tagId: data.tagId,
				order: data.order,
			},
		});
	}

	async findAllByGroupId(groupId: string) {
		return prisma.profileTag.findMany({
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
		const existing = await prisma.profileTag.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Tag", id);
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

			const duplicate = await prisma.profileTag.findUnique({
				where: {
					groupId_tagId: {
						groupId: existing.groupId,
						tagId: data.tagId,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"PROFILE_TAG_ALREADY_EXISTS",
					"This tag already exists in this group.",
				);
			}
		}

		return prisma.profileTag.update({
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
			throw new ValidationError("INVALID_ORDER", "Order must be greater than 0.");
		}

		const tag = await prisma.profileTag.findUnique({
			where: {
				id,
			},
		});

		if (!tag) {
			throw new NotFoundError("Profile Tag", id);
		}

		if (tag.order === newOrder) {
			return tag;
		}

		return prisma.$transaction(async (tx) => {
			const tags = await tx.profileTag.findMany({
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
				await tx.profileTag.update({
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
				await tx.profileTag.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.profileTag.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const tag = await prisma.profileTag.findUnique({
			where: {
				id,
			},
		});

		if (!tag) {
			throw new NotFoundError("Profile Tag", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.profileTag.delete({
				where: {
					id,
				},
			});

			const tags = await tx.profileTag.findMany({
				where: {
					groupId: tag.groupId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(tags);

			for (const { item, order } of reordered) {
				await tx.profileTag.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.profileTag.update({
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

export const profileTagService = new ProfileTagService();
