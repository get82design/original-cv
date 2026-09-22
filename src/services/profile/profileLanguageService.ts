import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreateLanguageInput, UpdateLanguageInput } from "../schemas/language.schema";

export class ProfileLanguageService {
	async create(profileId: string, data: CreateLanguageInput) {
		const profile = await prisma.profile.findUnique({
			where: {
				id: profileId,
			},
			select: {
				id: true,
			},
		});

		if (!profile) {
			throw new NotFoundError("Profile", profileId);
		}

		const existing = await prisma.language.findUnique({
			where: {
				profileId_name: {
					profileId,
					name: data.name,
				},
			},
		});

		if (existing) {
			throw new ConflictError(
				"PROFILE_LANGUAGE_ALREADY_EXISTS",
				"This language already exists for this Profile.",
			);
		}

		const existingOrder = await prisma.language.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_LANGUAGE_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		return prisma.language.create({
			data: {
				profileId,
				name: data.name,
				level: data.level,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.language.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateLanguageInput) {
		const existing = await prisma.language.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Language", id);
		}

		if (data.name) {
			const duplicate = await prisma.language.findFirst({
				where: {
					profileId: existing.profileId,
					name: data.name,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"PROFILE_LANGUAGE_ALREADY_EXISTS",
					"This language already exists for this Profile.",
				);
			}
		}

		return prisma.language.update({
			where: {
				id,
			},
			data: {
				...(data.name !== undefined ? { name: data.name } : {}),
				...(data.level !== undefined ? { level: data.level } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const language = await prisma.language.findUnique({
			where: {
				id,
			},
		});

		if (!language) {
			throw new NotFoundError("Profile Language", id);
		}

		if (language.order === newOrder) {
			return language;
		}

		return prisma.$transaction(async (tx) => {
			const languages = await tx.language.findMany({
				where: {
					profileId: language.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(languages, id, newOrder);

			// 1) Libère les contraintes uniques
			for (const { item, order } of reordered) {
				await tx.language.update({
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
				await tx.language.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.language.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const language = await prisma.language.findUnique({
			where: {
				id,
			},
		});

		if (!language) {
			throw new NotFoundError("Profile Language", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.language.delete({
				where: {
					id,
				},
			});

			const languages = await tx.language.findMany({
				where: {
					profileId: language.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(languages);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.language.update({
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
				await tx.language.update({
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

export const profileLanguageService = new ProfileLanguageService();
