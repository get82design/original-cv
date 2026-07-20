import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import type {
	CreateCvFormationDto,
	UpdateCvFormationDto,
} from "../dto/CvFormationDto";
import { ConflictError, NotFoundError } from "../errors";

export class ProfileFormationService {
	async create(profileId: string, data: CreateCvFormationDto) {
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

		const existingFormation = await prisma.formation.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingFormation) {
			throw new ConflictError(
				"PROFILE_FORMATION_ALREADY_EXISTS",
				"This formation already exists for this Profile.",
			);
		}

		const existingOrder = await prisma.formation.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_FORMATION_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		validateTimeline(data.start, data.end, data.status);

		return prisma.formation.create({
			data: {
				profileId,
				title: data.title,
				start: data.start,
				end: data.end ?? null,
				status: data.status ?? null,
				order: data.order,
				organismeFormation: data.organismeFormation ?? null,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.formation.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvFormationDto) {
		const existing = await prisma.formation.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Formation", id);
		}

		if (data.title) {
			const duplicate = await prisma.formation.findFirst({
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
					"PROFILE_FORMATION_ALREADY_EXISTS",
					"This formation already exists for this Profile.",
				);
			}
		}

		validateTimeline(
			data.start ?? existing.start,
			data.end !== undefined ? data.end : existing.end,
			data.status !== undefined ? data.status : existing.status,
		);

		const dataToUpdate = {
			title: data.title ?? existing.title,
			organismeFormation:
				data.organismeFormation ?? existing.organismeFormation,
			start: data.start ?? existing.start,
			end: data.end !== undefined ? data.end : existing.end,
			status: data.status !== undefined ? data.status : existing.status,
		};

		return prisma.formation.update({
			where: {
				id,
			},
			data: dataToUpdate,
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const formation = await prisma.formation.findUnique({
			where: {
				id,
			},
		});

		if (!formation) {
			throw new NotFoundError("Profile Formation", id);
		}

		if (formation.order === newOrder) {
			return formation;
		}

		return prisma.$transaction(async (tx) => {
			const formations = await tx.formation.findMany({
				where: {
					profileId: formation.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(formations, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.formation.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.formation.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.formation.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const formation = await prisma.formation.findUnique({
			where: {
				id,
			},
		});

		if (!formation) {
			throw new NotFoundError("Profile Formation", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.formation.delete({
				where: {
					id,
				},
			});

			const formations = await tx.formation.findMany({
				where: {
					profileId: formation.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(formations);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.formation.update({
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
				await tx.formation.update({
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

export const profileFormationService = new ProfileFormationService();
