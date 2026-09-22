import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreateStrengthInput, UpdateStrengthInput } from "../schemas/strength.schema";

export class ProfileStrengthService {
	async create(profileId: string, data: CreateStrengthInput) {
		const profile = await prisma.profile.findUnique({
			where: {
				id: profileId,
			},
		});

		if (!profile) {
			throw new NotFoundError("Profile", profileId);
		}

		const existingStrength = await prisma.strength.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingStrength) {
			throw new ConflictError(
				"PROFILE_STRENGTH_ALREADY_EXISTS",
				"This strength already exists for this profile.",
			);
		}

		const existingOrder = await prisma.strength.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_STRENGTH_ORDER_ALREADY_EXISTS",
				"This order is already used for this profile.",
			);
		}

		return prisma.strength.create({
			data: {
				profileId,
				title: data.title,
				icon: data.icon ?? null,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.strength.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateStrengthInput) {
		const existing = await prisma.strength.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Strength", id);
		}

		if (data.title) {
			const duplicate = await prisma.strength.findFirst({
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
					"PROFILE_STRENGTH_ALREADY_EXISTS",
					"This strength already exists for this profile.",
				);
			}
		}

		return prisma.strength.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.icon !== undefined ? { icon: data.icon } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const strength = await prisma.strength.findUnique({
			where: {
				id,
			},
		});

		if (!strength) {
			throw new NotFoundError("Profile Strength", id);
		}

		if (strength.order === newOrder) {
			return strength;
		}

		return prisma.$transaction(async (tx) => {
			const strengths = await tx.strength.findMany({
				where: {
					profileId: strength.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(strengths, id, newOrder);

			// On libère la contrainte unique
			for (const { item, order } of reordered) {
				await tx.strength.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			// On applique les nouveaux ordres
			for (const { item, order } of reordered) {
				await tx.strength.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.strength.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const strength = await prisma.strength.findUnique({
			where: {
				id,
			},
		});

		if (!strength) {
			throw new NotFoundError("Profile Strength", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.strength.delete({
				where: {
					id,
				},
			});

			const strengths = await tx.strength.findMany({
				where: {
					profileId: strength.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(strengths);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.strength.update({
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
				await tx.strength.update({
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

export const profileStrengthService = new ProfileStrengthService();
