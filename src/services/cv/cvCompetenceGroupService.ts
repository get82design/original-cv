import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import type {
	CreateCvCompetenceGroupDto,
	UpdateCvCompetenceGroupDto,
} from "../dto/CvCompetenceGroupDto";
import { ConflictError, NotFoundError, ValidationError } from "../errors";

export class CvCompetenceGroupService {
	async create(cvId: string, data: CreateCvCompetenceGroupDto) {
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
			const existingGroup = await prisma.cvCompetenceGroup.findFirst({
				where: {
					cvId: cvId,
					title: data.title,
				},
			});

			if (existingGroup) {
				throw new ConflictError("CV Competence Group already exists");
			}
		}

		const existingOrder = await prisma.cvCompetenceGroup.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_COMPETENCE_GROUP_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return await prisma.cvCompetenceGroup.create({
			data: {
				title: data.title,
				order: data.order,
				cvId: cvId,
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return await prisma.cvCompetenceGroup.findMany({
			where: {
				cvId: cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvCompetenceGroupDto) {
		const existing = await prisma.cvCompetenceGroup.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Competence Group", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvCompetenceGroup.findFirst({
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
					"CV_COMPETENCE_GROUP_ALREADY_EXISTS",
					"This competence group already exists for this CV.",
				);
			}
		}

		return await prisma.cvCompetenceGroup.update({
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

		const competenceGroup = await prisma.cvCompetenceGroup.findUnique({
			where: {
				id,
			},
		});

		if (!competenceGroup) {
			throw new NotFoundError("CV Competence Group", id);
		}

		if (competenceGroup.order === newOrder) {
			return competenceGroup;
		}

		return prisma.$transaction(async (tx) => {
			const competenceGroups = await tx.cvCompetenceGroup.findMany({
				where: {
					cvId: competenceGroup.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(competenceGroups, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvCompetenceGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvCompetenceGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvCompetenceGroup.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const competenceGroup = await prisma.cvCompetenceGroup.findUnique({
			where: {
				id,
			},
		});

		if (!competenceGroup) {
			throw new NotFoundError("CV Competence Group", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvCompetenceGroup.delete({
				where: {
					id,
				},
			});

			const competenceGroups = await tx.cvCompetenceGroup.findMany({
				where: {
					cvId: competenceGroup.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(competenceGroups);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvCompetenceGroup.update({
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
				await tx.cvCompetenceGroup.update({
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

export const cvCompetenceGroupService = new CvCompetenceGroupService();
