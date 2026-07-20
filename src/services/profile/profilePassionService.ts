import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import type {
	CreateCvPassionDto,
	UpdateCvPassionDto,
} from "../dto/CvPassionDto";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";

export class ProfilePassionService {
	async create(profileId: string, data: CreateCvPassionDto) {
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

		const existing = await prisma.passion.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existing) {
			throw new ConflictError(
				"PROFILE_PASSION_ALREADY_EXISTS",
				"This Passion already exists for this Profile.",
			);
		}

		const existingOrder = await prisma.passion.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_PASSION_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		return prisma.passion.create({
			data: {
				profileId,
				title: data.title,
				icon: data.icon,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.passion.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvPassionDto) {
		const passion = await prisma.passion.findUnique({
			where: {
				id,
			},
		});

		if (!passion) {
			throw new NotFoundError("Profile Passion", id);
		}

		if (data.title) {
			const existing = await prisma.passion.findFirst({
				where: {
					profileId: passion.profileId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (existing) {
				throw new ConflictError(
					"PROFILE_PASSION_ALREADY_EXISTS",
					"This passion already exists for this Profile.",
				);
			}
		}

		return prisma.passion.update({
			where: {
				id,
			},
			data,
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const passion = await prisma.passion.findUnique({
			where: {
				id,
			},
		});

		if (!passion) {
			throw new NotFoundError("Profile Passion", id);
		}

		if (passion.order === newOrder) {
			return passion;
		}

		return prisma.$transaction(async (tx) => {
			const passions = await tx.passion.findMany({
				where: {
					profileId: passion.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(passions, id, newOrder);

			// On libère la contrainte unique
			for (const { item, order } of reordered) {
				await tx.passion.update({
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
				await tx.passion.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.passion.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const passion = await prisma.passion.findUnique({
			where: {
				id,
			},
		});

		if (!passion) {
			throw new NotFoundError("Profile Passion", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.passion.delete({
				where: {
					id,
				},
			});

			const passions = await tx.passion.findMany({
				where: {
					profileId: passion.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const compacted = compactOrder(passions);

			for (const { item, order } of compacted) {
				await tx.passion.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of compacted) {
				await tx.passion.update({
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

export const profilePassionService = new ProfilePassionService();
