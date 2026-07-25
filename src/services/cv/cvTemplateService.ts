import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type { CreateCvTemplateInput } from "../schemas/cvTemplate.schema";

export class CvTemplateService {
	// CREATE
	async create(data: CreateCvTemplateInput) {
		const existing = await prisma.cVTemplate.findUnique({
			where: {
				name: data.name,
			},
		});

		if (existing) {
			throw new ConflictError("Template name already exists");
		}

		return prisma.cVTemplate.create({
			data: {
				name: data.name,
				structure: data.structure,
				defaultStyles: data.defaultStyles,
			},
		});
	}

	// FIND BY ID
	async findById(id: string) {
		const template = await prisma.cVTemplate.findUnique({
			where: {
				id,
			},
			select: {
				id: true,
				name: true,
				structure: true,
				defaultStyles: true,
			},
		});

		if (!template) {
			throw new NotFoundError("CV Template", id);
		}

		return template;
	}

	// FIND ALL
	async findAll() {
		return prisma.cVTemplate.findMany({
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				structure: true,
				defaultStyles: true,
			},
		});
	}

	// UPDATE (réservé à l'admin) => //! TODO

	// DELETE (réservé à l'admin) => //! TODO
}

export const cvTemplateService = new CvTemplateService();
