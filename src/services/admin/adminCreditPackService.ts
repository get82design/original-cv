import { prisma } from "../../../lib/prisma";
import { NotFoundError, ValidationError } from "../errors";

export type CreditPackListItem = {
	id: string;
	name: string;
	description: string | null;
	priceCents: number;
	downloadCredits: number;
	freeDownloads: number;
	sortOrder: number;
	isActive: boolean;
	stripePriceId: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreditPackUpsertInput = {
	name: string;
	description?: string | null | undefined;
	priceCents: number;
	downloadCredits: number;
	freeDownloads?: number | undefined;
	sortOrder?: number | undefined;
	isActive?: boolean | undefined;
	stripePriceId?: string | null | undefined;
};

/** Patch partiel compatible exactOptionalPropertyTypes + output Zod. */
export type CreditPackUpdatePatch = {
	name?: string | undefined;
	description?: string | null | undefined;
	priceCents?: number | undefined;
	downloadCredits?: number | undefined;
	freeDownloads?: number | undefined;
	sortOrder?: number | undefined;
	isActive?: boolean | undefined;
	stripePriceId?: string | null | undefined;
};

function mapPack(p: {
	id: string;
	name: string;
	description: string | null;
	priceCents: number;
	downloadCredits: number;
	freeDownloads: number;
	sortOrder: number;
	isActive: boolean;
	stripePriceId: string | null;
	createdAt: Date;
	updatedAt: Date;
}): CreditPackListItem {
	return {
		id: p.id,
		name: p.name,
		description: p.description,
		priceCents: p.priceCents,
		downloadCredits: p.downloadCredits,
		freeDownloads: p.freeDownloads,
		sortOrder: p.sortOrder,
		isActive: p.isActive,
		stripePriceId: p.stripePriceId,
		createdAt: p.createdAt,
		updatedAt: p.updatedAt,
	};
}

export class AdminCreditPackService {
	async listPacks(input?: {
		activeOnly?: boolean | undefined;
	}): Promise<CreditPackListItem[]> {
		const packs = await prisma.creditPack.findMany({
			...(input?.activeOnly ? { where: { isActive: true } } : {}),
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		});
		return packs.map(mapPack);
	}

	async createPack(input: CreditPackUpsertInput): Promise<CreditPackListItem> {
		this.validate(input);
		const pack = await prisma.creditPack.create({
			data: {
				name: input.name.trim(),
				description: input.description?.trim() || null,
				priceCents: input.priceCents,
				downloadCredits: input.downloadCredits,
				freeDownloads: input.freeDownloads ?? 0,
				sortOrder: input.sortOrder ?? 0,
				isActive: input.isActive ?? true,
				stripePriceId: input.stripePriceId?.trim() || null,
			},
		});
		return mapPack(pack);
	}

	async updatePack(
		id: string,
		patch: CreditPackUpdatePatch,
	): Promise<CreditPackListItem> {
		const existing = await prisma.creditPack.findUnique({ where: { id } });
		if (!existing) throw new NotFoundError("Pack de crédits introuvable");

		const merged: CreditPackUpsertInput = {
			name: patch.name ?? existing.name,
			description:
				patch.description !== undefined
					? patch.description
					: existing.description,
			priceCents: patch.priceCents ?? existing.priceCents,
			downloadCredits: patch.downloadCredits ?? existing.downloadCredits,
			freeDownloads: patch.freeDownloads ?? existing.freeDownloads,
			sortOrder: patch.sortOrder ?? existing.sortOrder,
			isActive: patch.isActive ?? existing.isActive,
			stripePriceId:
				patch.stripePriceId !== undefined
					? patch.stripePriceId
					: existing.stripePriceId,
		};
		this.validate(merged);

		const pack = await prisma.creditPack.update({
			where: { id },
			data: {
				name: merged.name.trim(),
				description: merged.description?.trim() || null,
				priceCents: merged.priceCents,
				downloadCredits: merged.downloadCredits,
				freeDownloads: merged.freeDownloads ?? 0,
				sortOrder: merged.sortOrder ?? 0,
				isActive: merged.isActive ?? true,
				stripePriceId: merged.stripePriceId?.trim() || null,
			},
		});
		return mapPack(pack);
	}

	async deletePack(id: string): Promise<void> {
		const existing = await prisma.creditPack.findUnique({ where: { id } });
		if (!existing) throw new NotFoundError("Pack de crédits introuvable");
		await prisma.creditPack.delete({ where: { id } });
	}

	private validate(input: CreditPackUpsertInput) {
		if (!input.name.trim()) {
			throw new ValidationError("Le nom du pack est requis");
		}
		if (input.priceCents < 0) {
			throw new ValidationError("Le prix doit être ≥ 0");
		}
		if (input.downloadCredits < 1) {
			throw new ValidationError("Au moins 1 crédit payant requis");
		}
		if ((input.freeDownloads ?? 0) < 0) {
			throw new ValidationError("freeDownloads doit être ≥ 0");
		}
	}
}

export const adminCreditPackService = new AdminCreditPackService();
