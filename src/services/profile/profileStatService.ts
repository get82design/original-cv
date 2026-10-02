import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreateStatInput, UpdateStatInput } from "../schemas/stat.schema";

export class ProfileStatService {
	async create(profileId: string, data: CreateStatInput) {
		const profile = await prisma.profile.findUnique({
			where: {
				id: profileId,
			},
		});

		if (!profile) {
			throw new NotFoundError("Profile", profileId);
		}

		const existingStat = await prisma.stat.findUnique({
			where: {
				profileId_label: {
					profileId,
					label: data.label,
				},
			},
		});

		if (existingStat) {
			throw new ConflictError(
				"PROFILE_STAT_ALREADY_EXISTS",
				"Cette statistique existe déjà pour ce profil.",
			);
		}

		const existingOrder = await prisma.stat.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_STAT_ORDER_ALREADY_EXISTS",
				"Cet ordre est déjà utilisé pour ce profil.",
			);
		}

		return prisma.stat.create({
			data: {
				profileId,
				label: data.label,
				value: data.value,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.stat.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateStatInput) {
		const existing = await prisma.stat.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Stat", id);
		}

		if (data.label) {
			const duplicate = await prisma.stat.findFirst({
				where: {
					profileId: existing.profileId,
					label: data.label,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"PROFILE_STAT_ALREADY_EXISTS",
					"Cette statistique existe déjà pour ce profil.",
				);
			}
		}

		return prisma.stat.update({
			where: {
				id,
			},
			data: {
				...(data.label !== undefined ? { label: data.label } : {}),
				...(data.value !== undefined ? { value: data.value } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const stat = await prisma.stat.findUnique({
			where: {
				id,
			},
		});

		if (!stat) {
			throw new NotFoundError("Profile Stat", id);
		}

		if (stat.order === newOrder) {
			return stat;
		}

		return prisma.$transaction(async (tx) => {
			const stats = await tx.stat.findMany({
				where: {
					profileId: stat.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(stats, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.stat.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.stat.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.stat.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const stat = await prisma.stat.findUnique({
			where: {
				id,
			},
		});

		if (!stat) {
			throw new NotFoundError("Profile Stat", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.stat.delete({
				where: {
					id,
				},
			});

			const stats = await tx.stat.findMany({
				where: {
					profileId: stat.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(stats);

			for (const { item, order } of reordered) {
				await tx.stat.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.stat.update({
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

export const profileStatService = new ProfileStatService();
