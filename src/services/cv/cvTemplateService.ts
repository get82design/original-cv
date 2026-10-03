import type { TemplateStyleCategory } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type { CreateCvTemplateInput } from "../schemas/cvTemplate.schema";
import { resolveTemplateNeighbors, type TemplateNavItem } from "./templateNeighbors";
import { slugifyTemplateName } from "./templateSlug";

const catalogSelect = {
	id: true,
	name: true,
	slug: true,
	structure: true,
	defaultStyles: true,
	isActive: true,
	isPremium: true,
	isFeatured: true,
	styleCategory: true,
	priceCents: true,
	priceCredits: true,
} as const;

/** Champs publics page marketing `/modeles/[slug]` (sans structure lourde). */
const publicDetailSelect = {
	id: true,
	name: true,
	slug: true,
	structure: true,
	isActive: true,
	isPremium: true,
	isFeatured: true,
	styleCategory: true,
	priceCents: true,
	priceCredits: true,
} as const;

export type PublicTemplateDetail = {
	id: string;
	name: string;
	slug: string;
	isPremium: boolean;
	isFeatured: boolean;
	styleCategory: TemplateStyleCategory;
	priceCents: number | null;
	priceCredits: number | null;
	columns: number;
};

export type PublicTemplateDetailPage = PublicTemplateDetail & {
	prev: TemplateNavItem | null;
	next: TemplateNavItem | null;
};

function columnsFromStructure(structure: unknown): number {
	const layout = structure as { layout?: { columns?: number } } | null;
	return layout?.layout?.columns ?? 1;
}

export class CvTemplateService {
	// CREATE
	async create(data: CreateCvTemplateInput) {
		const slug = slugifyTemplateName(data.name);
		if (!slug) {
			throw new ConflictError("Impossible de dériver un slug depuis le nom du template");
		}

		const existingName = await prisma.cVTemplate.findUnique({
			where: { name: data.name },
		});
		if (existingName) {
			throw new ConflictError("Template name already exists");
		}

		const existingSlug = await prisma.cVTemplate.findUnique({
			where: { slug },
		});
		if (existingSlug) {
			throw new ConflictError("Un template avec ce slug existe déjà");
		}

		return prisma.cVTemplate.create({
			data: {
				name: data.name,
				slug,
				structure: data.structure,
				defaultStyles: data.defaultStyles,
			},
		});
	}

	// FIND BY ID (y compris inactif — CV déjà lié)
	async findById(id: string) {
		const template = await prisma.cVTemplate.findUnique({
			where: { id },
			select: catalogSelect,
		});

		if (!template) {
			throw new NotFoundError("CV Template", id);
		}

		return template;
	}

	/**
	 * Fiche catalogue publique par slug (actifs seulement).
	 */
	async findPublicBySlug(slug: string): Promise<PublicTemplateDetail> {
		const normalized = slug.trim().toLowerCase();
		const template = await prisma.cVTemplate.findFirst({
			where: { slug: normalized, isActive: true },
			select: publicDetailSelect,
		});

		if (!template) {
			throw new NotFoundError("CV Template", slug);
		}

		return {
			id: template.id,
			name: template.name,
			slug: template.slug,
			isPremium: template.isPremium,
			isFeatured: template.isFeatured,
			styleCategory: template.styleCategory,
			priceCents: template.priceCents,
			priceCredits: template.priceCredits,
			columns: columnsFromStructure(template.structure),
		};
	}

	/**
	 * Fiche publique + voisin précédent / suivant (ordre catalogue).
	 */
	async findPublicDetailPage(slug: string): Promise<PublicTemplateDetailPage> {
		const detail = await this.findPublicBySlug(slug);
		const ordered = await prisma.cVTemplate.findMany({
			where: { isActive: true },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
			select: { slug: true, name: true },
		});
		const { prev, next } = resolveTemplateNeighbors(ordered, detail.slug);
		return { ...detail, prev, next };
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
