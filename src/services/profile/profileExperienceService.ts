import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateExperienceInput,
	UpdateExperienceInput,
} from "../schemas/experience.schema";

export class ProfileExperienceService {
	async create(profileId: string, data: CreateExperienceInput) {
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

		const existingExperience = await prisma.experience.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingExperience) {
			throw new ConflictError(
				"PROFILE_EXPERIENCE_ALREADY_EXISTS",
				"This experience already exists for this profile.",
			);
		}

		const existingOrder = await prisma.experience.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_EXPERIENCE_ORDER_ALREADY_EXISTS",
				"This order is already used for this profile.",
			);
		}

		validateTimeline(data.start, data.end);

		return prisma.experience.create({
			data: {
				profileId,
				title: data.title,
				company: data.company,
				description: data.description ?? null,
				location: data.location ?? null,
				start: data.start,
				end: data.end ?? null,
				order: data.order,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.experience.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateExperienceInput) {
		const existing = await prisma.experience.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Experience", id);
		}

		if (data.title) {
			const duplicate = await prisma.experience.findFirst({
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
					"PROFILE_EXPERIENCE_ALREADY_EXISTS",
					"This experience already exists for this profile.",
				);
			}
		}

		validateTimeline(
			data.start ?? existing.start,
			data.end !== undefined ? data.end : existing.end,
		);

		const dataToUpdate = {
			title: data.title ?? existing.title,
			description: data.description ?? existing.description,
			location: data.location ?? existing.location,
			start: data.start ?? existing.start,
			end: data.end !== undefined ? data.end : existing.end,
			company: data.company ?? existing.company,
		};

		return prisma.experience.update({
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

		const experience = await prisma.experience.findUnique({
			where: {
				id,
			},
		});

		if (!experience) {
			throw new NotFoundError("Profile Experience", id);
		}

		if (experience.order === newOrder) {
			return experience;
		}

		return prisma.$transaction(async (tx) => {
			const experiences = await tx.experience.findMany({
				where: {
					profileId: experience.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(experiences, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.experience.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.experience.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.experience.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const experience = await prisma.experience.findUnique({
			where: {
				id,
			},
		});

		if (!experience) {
			throw new NotFoundError("Profile Experience", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.experience.delete({
				where: {
					id,
				},
			});

			const experiences = await tx.experience.findMany({
				where: {
					profileId: experience.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(experiences);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.experience.update({
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
				await tx.experience.update({
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

export const profileExperienceService = new ProfileExperienceService();
