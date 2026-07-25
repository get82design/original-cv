import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type {
	CreateSkillGroupInput,
	UpdateSkillGroupInput,
} from "../schemas/skillGroup.schema";

export class CvSkillGroupService {
	async create(cvId: string, data: CreateSkillGroupInput) {
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
			const existingGroup = await prisma.cvSkillGroup.findFirst({
				where: {
					cvId: cvId,
					title: data.title,
				},
			});

			if (existingGroup) {
				throw new ConflictError("Group already exists");
			}
		}

		const existingOrder = await prisma.cvSkillGroup.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_SKILL_GROUP_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return await prisma.cvSkillGroup.create({
			data: {
				title: data.title,
				order: data.order,
				cvId: cvId,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return await prisma.cvSkillGroup.findMany({
			where: {
				cvId: cvId,
			},
			include: {
				skills: {
					include: {
						skill: true,
					},
				},
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateSkillGroupInput) {
		const existing = await prisma.cvSkillGroup.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Skill Group", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvSkillGroup.findFirst({
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
					"CV_SKILL_GROUP_ALREADY_EXISTS",
					"This skill group already exists for this CV.",
				);
			}
		}

		return await prisma.cvSkillGroup.update({
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

		const skillGroup = await prisma.cvSkillGroup.findUnique({
			where: {
				id,
			},
		});

		if (!skillGroup) {
			throw new NotFoundError("CV Skill Group", id);
		}

		if (skillGroup.order === newOrder) {
			return skillGroup;
		}

		return prisma.$transaction(async (tx) => {
			const skillGroups = await tx.cvSkillGroup.findMany({
				where: {
					cvId: skillGroup.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(skillGroups, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvSkillGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvSkillGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvSkillGroup.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const skillGroup = await prisma.cvSkillGroup.findUnique({
			where: {
				id,
			},
		});

		if (!skillGroup) {
			throw new NotFoundError("CV Skill Group", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvSkillGroup.delete({
				where: {
					id,
				},
			});

			const skillGroups = await tx.cvSkillGroup.findMany({
				where: {
					cvId: skillGroup.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(skillGroups);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvSkillGroup.update({
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
				await tx.cvSkillGroup.update({
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

export const cvSkillGroupService = new CvSkillGroupService();
