import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type {
	CreateExpertiseInput,
	UpdateExpertiseInput,
} from "../schemas/expertise.schema";

export class ProfileExpertiseService {
	async create(profileId: string, data: CreateExpertiseInput) {
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

		const existing = await prisma.expertise.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existing) {
			throw new ConflictError(
				"PROFILE_EXPERTISE_ALREADY_EXISTS",
				"This Expertise already exists for this Profile.",
			);
		}

		const existingOrder = await prisma.expertise.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_EXPERTISE_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		return prisma.expertise.create({
			data: {
				profileId,
				title: data.title,
				level: data.level,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.expertise.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateExpertiseInput) {
		const existing = await prisma.expertise.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Expertise", id);
		}

		if (data.title) {
			const duplicate = await prisma.expertise.findFirst({
				where: {
					profileId: existing.profileId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"PROFILE_EXPERTISE_ALREADY_EXISTS",
					"This expertise already exists for this Profile.",
				);
			}
		}

		return prisma.expertise.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.level !== undefined ? { level: data.level } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const expertise = await prisma.expertise.findUnique({
			where: {
				id,
			},
		});

		if (!expertise) {
			throw new NotFoundError("Profile Expertise", id);
		}

		if (expertise.order === newOrder) {
			return expertise;
		}

		return prisma.$transaction(async (tx) => {
			const expertises = await tx.expertise.findMany({
				where: {
					profileId: expertise.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(expertises, id, newOrder);

			// 1) Libère les contraintes uniques
			for (const { item, order } of reordered) {
				await tx.expertise.update({
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
				await tx.expertise.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.expertise.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const expertise = await prisma.expertise.findUnique({
			where: {
				id,
			},
		});

		if (!expertise) {
			throw new NotFoundError("Profile Expertise", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.expertise.delete({
				where: {
					id,
				},
			});

			const expertises = await tx.expertise.findMany({
				where: {
					profileId: expertise.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(expertises);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.expertise.update({
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
				await tx.expertise.update({
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

export const profileExpertiseService = new ProfileExpertiseService();
