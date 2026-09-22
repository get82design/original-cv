import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type { CreateSkillInput, UpdateSkillInput } from "../schemas/skill.schema";

export class CvSkillService {
	async create(groupId: string, data: CreateSkillInput) {
		const group = await prisma.cvSkillGroup.findUnique({
			where: {
				id: groupId,
			},
		});

		if (!group) {
			throw new NotFoundError("Group not found");
		}

		const skill = await prisma.skill.findUnique({
			where: {
				id: data.skillId,
			},
		});

		if (!skill) {
			throw new NotFoundError("Skill", data.skillId);
		}

		const existingSkillInGroup = await prisma.cvSkill.findFirst({
			where: {
				groupId: groupId,
				skillId: data.skillId,
			},
		});

		if (existingSkillInGroup) {
			throw new ConflictError("Skill already exists in group");
		}

		const existingOrder = await prisma.cvSkill.findUnique({
			where: {
				groupId_order: {
					groupId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_SKILL_ORDER_ALREADY_EXISTS",
				"This order is already used in this group.",
			);
		}

		return await prisma.cvSkill.create({
			data: {
				groupId,
				level: data.level,
				skillId: data.skillId,
				order: data.order,
			},
		});
	}

	async findAllByGroupId(groupId: string) {
		return prisma.cvSkill.findMany({
			where: {
				groupId,
			},
			include: {
				skill: true,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateSkillInput) {
		const existing = await prisma.cvSkill.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Skill", id);
		}

		if (data.skillId && data.skillId !== existing.skillId) {
			const skill = await prisma.skill.findUnique({
				where: {
					id: data.skillId,
				},
			});

			if (!skill) {
				throw new NotFoundError("Skill", data.skillId);
			}

			const duplicate = await prisma.cvSkill.findUnique({
				where: {
					groupId_skillId: {
						groupId: existing.groupId,
						skillId: data.skillId,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_SKILL_ALREADY_EXISTS",
					"This skill already exists in this group.",
				);
			}
		}

		return prisma.cvSkill.update({
			where: {
				id,
			},
			data: {
				level: data.level ?? existing.level,
				skillId: data.skillId ?? existing.skillId,
			},
			include: {
				skill: true,
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new ValidationError("INVALID_ORDER", "Order must be greater than 0.");
		}

		const skill = await prisma.cvSkill.findUnique({
			where: {
				id,
			},
		});

		if (!skill) {
			throw new NotFoundError("CV Skill", id);
		}

		if (skill.order === newOrder) {
			return skill;
		}

		return prisma.$transaction(async (tx) => {
			const skills = await tx.cvSkill.findMany({
				where: {
					groupId: skill.groupId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(skills, id, newOrder);

			// Libération des contraintes uniques
			for (const { item, order } of reordered) {
				await tx.cvSkill.update({
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
				await tx.cvSkill.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvSkill.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const skill = await prisma.cvSkill.findUnique({
			where: {
				id,
			},
		});

		if (!skill) {
			throw new NotFoundError("CV Skill", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvSkill.delete({
				where: {
					id,
				},
			});

			const skills = await tx.cvSkill.findMany({
				where: {
					groupId: skill.groupId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(skills);

			for (const { item, order } of reordered) {
				await tx.cvSkill.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvSkill.update({
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

export const cvSkillService = new CvSkillService();
