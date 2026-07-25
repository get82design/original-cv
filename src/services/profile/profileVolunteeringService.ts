import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateVolunteeringInput,
	UpdateVolunteeringInput,
} from "../schemas/volunteering.schema";

export class ProfileVolunteeringService {
	async create(profileId: string, data: CreateVolunteeringInput) {
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

		const existingVolunteering = await prisma.volunteering.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingVolunteering) {
			throw new ConflictError(
				"PROFILE_VOLUNTEERING_ALREADY_EXISTS",
				"This volunteering already exists for this Profile.",
			);
		}

		const existingOrder = await prisma.volunteering.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_VOLUNTEERING_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		validateTimeline(data.start, data.end);

		return prisma.volunteering.create({
			data: {
				profileId,
				title: data.title,
				organisation: data.organisation,
				description: data.description ?? null,
				location: data.location ?? null,
				start: data.start,
				end: data.end ?? null,
				order: data.order,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.volunteering.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateVolunteeringInput) {
		const existing = await prisma.volunteering.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Volunteering", id);
		}

		if (data.title) {
			const duplicate = await prisma.volunteering.findFirst({
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
					"PROFILE_VOLUNTEERING_ALREADY_EXISTS",
					"This volunteering already exists for this Profile.",
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
			organisation: data.organisation ?? existing.organisation,
		};

		return prisma.volunteering.update({
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

		const volunteering = await prisma.volunteering.findUnique({
			where: {
				id,
			},
		});

		if (!volunteering) {
			throw new NotFoundError("Profile Volunteering", id);
		}

		if (volunteering.order === newOrder) {
			return volunteering;
		}

		return prisma.$transaction(async (tx) => {
			const volunteerings = await tx.volunteering.findMany({
				where: {
					profileId: volunteering.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(volunteerings, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.volunteering.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.volunteering.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.volunteering.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const volunteering = await prisma.volunteering.findUnique({
			where: {
				id,
			},
		});

		if (!volunteering) {
			throw new NotFoundError("Profile Volunteering", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.volunteering.delete({
				where: {
					id,
				},
			});

			const volunteerings = await tx.volunteering.findMany({
				where: {
					profileId: volunteering.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(volunteerings);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.volunteering.update({
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
				await tx.volunteering.update({
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

export const profileVolunteeringService = new ProfileVolunteeringService();
