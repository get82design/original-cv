import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type { CreateSkillGroupInput, UpdateSkillGroupInput } from "../schemas/skillGroup.schema";

export class ProfileSkillGroupService {
	async create(profileId: string, data: CreateSkillGroupInput) {
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
			const existingGroup = await prisma.profileSkillGroup.findFirst({
				where: {
					profileId: profileId,
					title: data.title,
				},
			});

			if (existingGroup) {
				throw new ConflictError("Group already exists");
			}
		}

		const existingOrder = await prisma.profileSkillGroup.findUnique({
			where: {
				profileId_order: {
					profileId: profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_SKILL_GROUP_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		return await prisma.profileSkillGroup.create({
			data: {
				title: data.title,
				order: data.order,
				profileId: profileId,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return await prisma.profileSkillGroup.findMany({
			where: {
				profileId: profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateSkillGroupInput) {
		const existing = await prisma.profileSkillGroup.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Skill Group", id);
		}

		if (data.title) {
			const duplicate = await prisma.profileSkillGroup.findFirst({
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
					"PROFILE_SKILL_GROUP_ALREADY_EXISTS",
					"This skill group already exists for this Profile.",
				);
			}
		}

		return await prisma.profileSkillGroup.update({
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

		const skillGroup = await prisma.profileSkillGroup.findUnique({
			where: {
				id,
			},
		});

		if (!skillGroup) {
			throw new NotFoundError("Profile Skill Group", id);
		}

		if (skillGroup.order === newOrder) {
			return skillGroup;
		}

		return prisma.$transaction(async (tx) => {
			const skillGroups = await tx.profileSkillGroup.findMany({
				where: {
					profileId: skillGroup.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(skillGroups, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.profileSkillGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.profileSkillGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.profileSkillGroup.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const skillGroup = await prisma.profileSkillGroup.findUnique({
			where: {
				id,
			},
		});

		if (!skillGroup) {
			throw new NotFoundError("Profile Skill Group", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.profileSkillGroup.delete({
				where: {
					id,
				},
			});

			const skillGroups = await tx.profileSkillGroup.findMany({
				where: {
					profileId: skillGroup.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(skillGroups);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.profileSkillGroup.update({
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
				await tx.profileSkillGroup.update({
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

export const profileSkillGroupService = new ProfileSkillGroupService();
