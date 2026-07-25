import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type {
	CreateLanguageInput,
	UpdateLanguageInput,
} from "../schemas/language.schema";

export class CvLanguageService {
	async create(cvId: string, data: CreateLanguageInput) {
		const cv = await prisma.cV.findUnique({
			where: {
				id: cvId,
			},
			select: {
				id: true,
			},
		});

		if (!cv) {
			throw new NotFoundError("CV", cvId);
		}

		const existing = await prisma.cvLanguage.findUnique({
			where: {
				cvId_name: {
					cvId,
					name: data.name,
				},
			},
		});

		if (existing) {
			throw new ConflictError(
				"CV_LANGUAGE_ALREADY_EXISTS",
				"This language already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvLanguage.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_LANGUAGE_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cvLanguage.create({
			data: {
				cvId,
				name: data.name,
				level: data.level,
				order: data.order ?? 0,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvLanguage.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateLanguageInput) {
		const existing = await prisma.cvLanguage.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Language", id);
		}

		if (data.name) {
			const duplicate = await prisma.cvLanguage.findFirst({
				where: {
					cvId: existing.cvId,
					name: data.name,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_LANGUAGE_ALREADY_EXISTS",
					"This language already exists for this CV.",
				);
			}
		}

		return prisma.cvLanguage.update({
			where: {
				id,
			},
			data: {
				...(data.name !== undefined ? { name: data.name } : {}),
				...(data.level !== undefined ? { level: data.level } : {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const language = await prisma.cvLanguage.findUnique({
			where: {
				id,
			},
		});

		if (!language) {
			throw new NotFoundError("CV Language", id);
		}

		if (language.order === newOrder) {
			return language;
		}

		return prisma.$transaction(async (tx) => {
			const languages = await tx.cvLanguage.findMany({
				where: {
					cvId: language.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(languages, id, newOrder);

			// 1) Libère les contraintes uniques
			for (const { item, order } of reordered) {
				await tx.cvLanguage.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			// 2) Applique les nouveaux ordres
			for (const { item, order } of reordered) {
				await tx.cvLanguage.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvLanguage.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const language = await prisma.cvLanguage.findUnique({
			where: {
				id,
			},
		});

		if (!language) {
			throw new NotFoundError("CV Language", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvLanguage.delete({
				where: {
					id,
				},
			});

			const languages = await tx.cvLanguage.findMany({
				where: {
					cvId: language.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(languages);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvLanguage.update({
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
				await tx.cvLanguage.update({
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

export const cvLanguageService = new CvLanguageService();
