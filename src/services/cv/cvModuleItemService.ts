import { CVModuleItemType } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ValidationError } from "../errors";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import type { CvModuleItemInput } from "../schemas/cvModuleItem.schema";

export class CvModuleItemService {
	async create(moduleId: string, data: CvModuleItemInput) {
		const module = await prisma.cVModule.findUnique({
			where: {
				id: moduleId,
			},
			select: {
				id: true,
			},
		});

		if (!module) {
			throw new NotFoundError("CV Module", moduleId);
		}

		// Vérifie que l'élément référencé existe
		let exists = false;

		switch (data.itemType) {
			case CVModuleItemType.cvSkillGroup:
				exists = !!(await prisma.cvSkillGroup.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvExperience:
				exists = !!(await prisma.cvExperience.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvEducation:
				exists = !!(await prisma.cvEducation.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvProject:
				exists = !!(await prisma.cvProject.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvVolunteering:
				exists = !!(await prisma.cvVolunteering.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvPublication:
				exists = !!(await prisma.cvPublication.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvAchievement:
				exists = !!(await prisma.cvAchievement.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvExpertise:
				exists = !!(await prisma.cvExpertise.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvFormation:
				exists = !!(await prisma.cvFormation.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvCertification:
				exists = !!(await prisma.cvCertification.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvPrize:
				exists = !!(await prisma.cvPrize.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvLanguage:
				exists = !!(await prisma.cvLanguage.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvPassion:
				exists = !!(await prisma.cvPassion.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvCompetenceGroup:
				exists = !!(await prisma.cvCompetenceGroup.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;

			case CVModuleItemType.cvDescription:
				exists = !!(await prisma.cvDescription.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;
			case CVModuleItemType.cvPhilosophy:
				exists = !!(await prisma.cvPhilosophy.findUnique({
					where: { id: data.itemId },
					select: { id: true },
				}));
				break;
		}

		if (!exists) {
			throw new NotFoundError(data.itemType, data.itemId);
		}

		const existingOrder = await prisma.cVModuleItem.findUnique({
			where: {
				moduleId_order: {
					moduleId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_MODULE_ITEM_ORDER_ALREADY_EXISTS",
				"This order is already used in this module.",
			);
		}

		// Empêche d'ajouter deux fois le même élément au même module
		const duplicate = await prisma.cVModuleItem.findUnique({
			where: {
				moduleId_itemType_itemId: {
					moduleId,
					itemType: data.itemType,
					itemId: data.itemId,
				},
			},
		});

		if (duplicate) {
			throw new ConflictError(
				"CV_MODULE_ITEM_ALREADY_EXISTS",
				"This item already exists in this module.",
			);
		}

		return prisma.cVModuleItem.create({
			data: {
				moduleId,
				itemType: data.itemType,
				itemId: data.itemId,
				order: data.order,
			},
		});
	}

	async findAllByModuleId(moduleId: string) {
		return await prisma.cVModuleItem.findMany({
			where: {
				moduleId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new ValidationError("Invalid order");
		}

		const item = await prisma.cVModuleItem.findUnique({
			where: {
				id,
			},
		});

		if (!item) {
			throw new NotFoundError("CV Module Item", id);
		}

		if (item.order === newOrder) {
			return item;
		}

		return prisma.$transaction(async (tx) => {
			const items = await tx.cVModuleItem.findMany({
				where: {
					moduleId: item.moduleId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(items, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cVModuleItem.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cVModuleItem.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cVModuleItem.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const item = await prisma.cVModuleItem.findUnique({
			where: {
				id,
			},
		});

		if (!item) {
			throw new NotFoundError("CV Module Item", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cVModuleItem.delete({
				where: {
					id,
				},
			});

			const items = await tx.cVModuleItem.findMany({
				where: {
					moduleId: item.moduleId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(items);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cVModuleItem.update({
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
				await tx.cVModuleItem.update({
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

export const cvModuleItemService = new CvModuleItemService();
