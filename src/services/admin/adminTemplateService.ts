import type { Prisma } from "../../../generated/prisma/client";
import { Prisma as PrismaNS } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { NotFoundError, ValidationError } from "../errors";
import { parseUnlockGifts, type TemplateUnlockGifts } from "../commons/templateAccess";

export type AdminTemplateListItem = {
	id: string;
	name: string;
	isActive: boolean;
	isPremium: boolean;
	priceCents: number | null;
	priceCredits: number | null;
	isFeatured: boolean;
	sortOrder: number;
	unlockGifts: TemplateUnlockGifts | null;
	cvCount: number;
	unlockCount: number;
};

export type AdminTemplateListResult = {
	items: AdminTemplateListItem[];
	total: number;
	page: number;
	pageSize: number;
};

export type AdminTemplateCatalogPatch = {
	isActive?: boolean | undefined;
	isPremium?: boolean | undefined;
	priceCents?: number | null | undefined;
	priceCredits?: number | null | undefined;
	isFeatured?: boolean | undefined;
	sortOrder?: number | undefined;
	/** null = vider les cadeaux */
	unlockGifts?: TemplateUnlockGifts | null | undefined;
};

export class AdminTemplateService {
	async listTemplates(input: {
		search?: string | undefined;
		isActive?: boolean | undefined;
		isPremium?: boolean | undefined;
		isFeatured?: boolean | undefined;
		page?: number | undefined;
		pageSize?: number | undefined;
	}): Promise<AdminTemplateListResult> {
		const page = Math.max(1, input.page ?? 1);
		const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
		const search = input.search?.trim();

		const where: Prisma.CVTemplateWhereInput = {
			...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
			...(typeof input.isPremium === "boolean" ? { isPremium: input.isPremium } : {}),
			...(typeof input.isFeatured === "boolean" ? { isFeatured: input.isFeatured } : {}),
			...(search
				? {
						name: {
							contains: search,
							mode: "insensitive",
						},
					}
				: {}),
		};

		const [total, rows] = await Promise.all([
			prisma.cVTemplate.count({ where }),
			prisma.cVTemplate.findMany({
				where,
				orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					name: true,
					isActive: true,
					isPremium: true,
					priceCents: true,
					priceCredits: true,
					isFeatured: true,
					sortOrder: true,
					unlockGifts: true,
					_count: {
						select: {
							cvs: true,
							unlockedTemplates: true,
						},
					},
				},
			}),
		]);

		return {
			total,
			page,
			pageSize,
			items: rows.map((t) => ({
				id: t.id,
				name: t.name,
				isActive: t.isActive,
				isPremium: t.isPremium,
				priceCents: t.priceCents,
				priceCredits: t.priceCredits,
				isFeatured: t.isFeatured,
				sortOrder: t.sortOrder,
				unlockGifts: parseUnlockGifts(t.unlockGifts),
				cvCount: t._count.cvs,
				unlockCount: t._count.unlockedTemplates,
			})),
		};
	}

	async getTemplate(id: string): Promise<AdminTemplateListItem> {
		const t = await prisma.cVTemplate.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				isActive: true,
				isPremium: true,
				priceCents: true,
				priceCredits: true,
				isFeatured: true,
				sortOrder: true,
				unlockGifts: true,
				_count: {
					select: {
						cvs: true,
						unlockedTemplates: true,
					},
				},
			},
		});
		if (!t) {
			throw new NotFoundError("CV_TEMPLATE", id);
		}
		return {
			id: t.id,
			name: t.name,
			isActive: t.isActive,
			isPremium: t.isPremium,
			priceCents: t.priceCents,
			priceCredits: t.priceCredits,
			isFeatured: t.isFeatured,
			sortOrder: t.sortOrder,
			unlockGifts: parseUnlockGifts(t.unlockGifts),
			cvCount: t._count.cvs,
			unlockCount: t._count.unlockedTemplates,
		};
	}

	/**
	 * Met à jour uniquement les champs catalogue (pas structure / defaultStyles).
	 */
	async updateCatalog(
		id: string,
		patch: AdminTemplateCatalogPatch,
	): Promise<AdminTemplateListItem> {
		const hasIsActive = typeof patch.isActive === "boolean";
		const hasIsPremium = typeof patch.isPremium === "boolean";
		const hasPrice = patch.priceCents !== undefined;
		const hasPriceCredits = patch.priceCredits !== undefined;
		const hasFeatured = typeof patch.isFeatured === "boolean";
		const hasSort = typeof patch.sortOrder === "number";
		const hasGifts = patch.unlockGifts !== undefined;

		if (
			!hasIsActive &&
			!hasIsPremium &&
			!hasPrice &&
			!hasPriceCredits &&
			!hasFeatured &&
			!hasSort &&
			!hasGifts
		) {
			throw new ValidationError("Aucun champ catalogue à mettre à jour");
		}

		if (hasPrice && patch.priceCents != null && patch.priceCents < 0) {
			throw new ValidationError("priceCents doit être ≥ 0");
		}
		if (hasPriceCredits && patch.priceCredits != null && patch.priceCredits < 0) {
			throw new ValidationError("priceCredits doit être ≥ 0");
		}

		const existing = await prisma.cVTemplate.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!existing) {
			throw new NotFoundError("CV_TEMPLATE", id);
		}

		const data: Prisma.CVTemplateUpdateInput = {};
		if (hasIsActive) data.isActive = patch.isActive!;
		if (hasIsPremium) data.isPremium = patch.isPremium!;
		if (hasPrice) data.priceCents = patch.priceCents ?? null;
		if (hasPriceCredits) data.priceCredits = patch.priceCredits ?? null;
		if (hasFeatured) data.isFeatured = patch.isFeatured!;
		if (hasSort) data.sortOrder = patch.sortOrder!;
		if (hasGifts) {
			if (patch.unlockGifts === null) {
				data.unlockGifts = PrismaNS.DbNull;
			} else {
				const parsed = parseUnlockGifts(patch.unlockGifts);
				data.unlockGifts = parsed == null ? PrismaNS.DbNull : (parsed as Prisma.InputJsonValue);
			}
		}

		await prisma.cVTemplate.update({ where: { id }, data });
		return this.getTemplate(id);
	}
}

export const adminTemplateService = new AdminTemplateService();
