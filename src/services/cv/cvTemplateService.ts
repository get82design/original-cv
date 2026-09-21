import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type { CreateCvTemplateInput } from "../schemas/cvTemplate.schema";

const catalogSelect = {
	id: true,
	name: true,
	structure: true,
	defaultStyles: true,
	isActive: true,
	isPremium: true,
	isFeatured: true,
	priceCents: true,
	priceCredits: true,
} as const;

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

	// FIND BY ID (y compris inactif — CV déjà lié)
	async findById(id: string) {
		const template = await prisma.cVTemplate.findUnique({
			where: {
				id,
			},
			select: catalogSelect,
		});

		if (!template) {
			throw new NotFoundError("CV Template", id);
		}

		return template;
	}

	/** Catalogue produit : actifs seulement, tri sortOrder puis nom. */
	async findAll() {
		return prisma.cVTemplate.findMany({
			where: { isActive: true },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
			select: catalogSelect,
		});
	}

	// UPDATE (réservé à l'admin) => //! TODO

	// DELETE (réservé à l'admin) => //! TODO
}

export const cvTemplateService = new CvTemplateService();
