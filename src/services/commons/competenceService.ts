import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateCompetenceSourceInput,
	UpdateCompetenceSourceInput,
} from "../schemas/competenceSource.schema";

export class CompetenceService {
	async create(data: CreateCompetenceSourceInput) {
		const existingCompetence = await prisma.competence.findFirst({
			where: {
				name: data.name.trim(),
			},
		});

		if (existingCompetence) {
			return existingCompetence;
		}

		return await prisma.competence.create({
			data: {
				name: data.name.trim(),
			},
		});
	}

	async findAll() {
		return await prisma.competence.findMany({
			orderBy: {
				name: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCompetenceSourceInput) {
		const competence = await prisma.competence.findUnique({
			where: {
				id,
			},
		});

		if (!competence) {
			throw new NotFoundError("Competence not found");
		}

		const existingCompetence = await prisma.competence.findFirst({
			where: {
				name: data.name?.trim() ?? "",
			},
		});

		if (existingCompetence) {
			throw new ConflictError("Competence already exists");
		}

		return await prisma.competence.update({
			where: {
				id,
			},
			data: {
				name: data.name?.trim() ?? "",
			},
		});
	}

	async delete(id: string) {
		const competence = await prisma.competence.findUnique({
			where: {
				id,
			},
		});

		if (!competence) {
			throw new NotFoundError("Competence not found");
		}

		const usedCompetence = await prisma.competence.findFirst({
			where: {
				id,
				OR: [
					{
						cvCompetences: {
							some: {},
						},
					},
					{
						profileCompetences: {
							some: {},
						},
					},
				],
			},
		});

		if (usedCompetence) {
			throw new ConflictError(
				"COMPETENCE_ALREADY_USED",
				"This competence is already used and cannot be deleted.",
			);
		}

		return await prisma.competence.delete({
			where: {
				id,
			},
		});
	}
}

export const competenceService = new CompetenceService();
