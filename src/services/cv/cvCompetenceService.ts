import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import type {
	CreateCompetenceInput,
	UpdateCompetenceInput,
} from "../schemas/competence.schema";

export class CvCompetenceService {
	async create(groupId: string, data: CreateCompetenceInput) {
		const group = await prisma.cvCompetenceGroup.findUnique({
			where: {
				id: groupId,
			},
		});

		if (!group) {
			throw new NotFoundError("CV Competence Group", groupId);
		}

		const competence = await prisma.competence.findUnique({
			where: {
				id: data.competenceId,
			},
		});

		if (!competence) {
			throw new NotFoundError("Competence", data.competenceId);
		}

		const existingCompetenceInGroup = await prisma.cvCompetence.findFirst({
			where: {
				groupId: groupId,
				competenceId: data.competenceId,
			},
		});

		if (existingCompetenceInGroup) {
			throw new ConflictError("Competence already exists in group");
		}

		const existingOrder = await prisma.cvCompetence.findUnique({
			where: {
				groupId_order: {
					groupId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_COMPETENCE_ORDER_ALREADY_EXISTS",
				"This order is already used in this group.",
			);
		}

		return await prisma.cvCompetence.create({
			data: {
				groupId,
				competenceId: data.competenceId,
				order: data.order,
			},
		});
	}

	async findAllByGroupId(groupId: string) {
		return prisma.cvCompetence.findMany({
			where: {
				groupId,
			},
			include: {
				competence: true,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCompetenceInput) {
		const existing = await prisma.cvCompetence.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Competence", id);
		}

		if (data.competenceId && data.competenceId !== existing.competenceId) {
			const competence = await prisma.competence.findUnique({
				where: {
					id: data.competenceId,
				},
			});

			if (!competence) {
				throw new NotFoundError("Competence", data.competenceId);
			}

			const duplicate = await prisma.cvCompetence.findUnique({
				where: {
					groupId_competenceId: {
						groupId: existing.groupId,
						competenceId: data.competenceId,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_COMPETENCE_ALREADY_EXISTS",
					"This competence already exists in this group.",
				);
			}
		}

		return prisma.cvCompetence.update({
			where: {
				id,
			},
			data: {
				competenceId: data.competenceId ?? existing.competenceId,
			},
			include: {
				competence: true,
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

		const competence = await prisma.cvCompetence.findUnique({
			where: {
				id,
			},
		});

		if (!competence) {
			throw new NotFoundError("CV Competence", id);
		}

		if (competence.order === newOrder) {
			return competence;
		}

		return prisma.$transaction(async (tx) => {
			const competencies = await tx.cvCompetence.findMany({
				where: {
					groupId: competence.groupId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(competencies, id, newOrder);

			// Libération des contraintes uniques
			for (const { item, order } of reordered) {
				await tx.cvCompetence.update({
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
				await tx.cvCompetence.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvCompetence.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const competence = await prisma.cvCompetence.findUnique({
			where: {
				id,
			},
		});

		if (!competence) {
			throw new NotFoundError("CV Competence", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvCompetence.delete({
				where: {
					id,
				},
			});

			const competencies = await tx.cvCompetence.findMany({
				where: {
					groupId: competence.groupId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(competencies);

			for (const { item, order } of reordered) {
				await tx.cvCompetence.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvCompetence.update({
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

export const cvCompetenceService = new CvCompetenceService();
