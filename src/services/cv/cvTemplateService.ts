import { prisma } from "../../../lib/prisma";
import type { CreateCvTemplateDto } from "../dto/CvTemplateDto";
import { ConflictError, NotFoundError } from "../errors";

export class CvTemplateService {
	// CREATE
	async create(data: CreateCvTemplateDto) {
		const existing = await prisma.cVTemplate.findUnique({
			where: {
				name: data.name,
			},
		});

		if (existing) {
			throw new ConflictError("Template name already exists");
		}

		return prisma.cVTemplate.create({
			data,
		});
	}

	// FIND BY ID
	async findById(id: string) {
		const template = await prisma.cVTemplate.findUnique({
			where: {
				id,
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
		});
	}

	// UPDATE (réservé à l'admin) => //! TODO

	// DELETE (réservé à l'admin) => //! TODO
}

export const cvTemplateService = new CvTemplateService();
