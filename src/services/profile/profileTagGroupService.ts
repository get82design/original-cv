import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type {
	CreateTagGroupInput,
	UpdateTagGroupInput,
} from "../schemas/tagGroup.schema";

export class ProfileTagGroupService {
	async create(profileId: string, data: CreateTagGroupInput) {
		const existingProfile = await prisma.profile.findUnique({
			where: {
				id: profileId,
			},
			select: {
				id: true,
			},
		});

		if (!existingProfile) {
			throw new NotFoundError("Profile", profileId);
		}

		if (data.title) {
			const existingGroup = await prisma.profileTagGroup.findFirst({
				where: {
					profileId: profileId,
					title: data.title,
				},
			});

			if (existingGroup) {
				throw new ConflictError("Profile Tag Group already exists");
			}
		}

		const existingOrder = await prisma.profileTagGroup.findUnique({
			where: {
				profileId_order: {
					profileId: profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_TAG_GROUP_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		return await prisma.profileTagGroup.create({
			data: {
				title: data.title,
				order: data.order,
				profileId: profileId,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return await prisma.profileTagGroup.findMany({
			where: {
				profileId: profileId,
			},
			include: { tags: { include: { tag: true } } },
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateTagGroupInput) {
		const existing = await prisma.profileTagGroup.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Tag Group", id);
		}

		if (data.title) {
			const duplicate = await prisma.profileTagGroup.findFirst({
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
					"PROFILE_TAG_GROUP_ALREADY_EXISTS",
					"This tag group already exists for this Profile.",
				);
			}
		}

		return await prisma.profileTagGroup.update({
			where: {
				id: id,
			},
			data: {
				title: data.title ?? existing.title,
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new ValidationError("Invalid order");
		}

		const tagGroup = await prisma.profileTagGroup.findUnique({
			where: {
				id,
			},
		});

		if (!tagGroup) {
			throw new NotFoundError("Profile Tag Group", id);
		}

		if (tagGroup.order === newOrder) {
			return tagGroup;
		}

		return prisma.$transaction(async (tx) => {
			const tagGroups = await tx.profileTagGroup.findMany({
				where: {
					profileId: tagGroup.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(tagGroups, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.profileTagGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.profileTagGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.profileTagGroup.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const tagGroup = await prisma.profileTagGroup.findUnique({
			where: {
				id,
			},
		});

		if (!tagGroup) {
			throw new NotFoundError("Profile Tag Group", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.profileTagGroup.delete({
				where: {
					id,
				},
			});

			const tagGroups = await tx.profileTagGroup.findMany({
				where: {
					profileId: tagGroup.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(tagGroups);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.profileTagGroup.update({
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
				await tx.profileTagGroup.update({
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

export const profileTagGroupService = new ProfileTagGroupService();
