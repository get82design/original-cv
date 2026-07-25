import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreatePublicationInput,
	UpdatePublicationInput,
} from "../schemas/publication.schema";

export class ProfilePublicationService {
	async create(profileId: string, data: CreatePublicationInput) {
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

		const existingPublication = await prisma.publication.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingPublication) {
			throw new ConflictError(
				"PROFILE_PUBLICATION_ALREADY_EXISTS",
				"This publication already exists for this Profile.",
			);
		}

		const existingOrder = await prisma.publication.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_PUBLICATION_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		validateTimeline(data.start, data.end, null);

		return prisma.publication.create({
			data: {
				profileId,
				title: data.title,
				start: data.start,
				end: data.end ?? null,
				order: data.order,
				description: data.description ?? null,
				journalName: data.journalName ?? null,
				url: data.url ?? null,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.publication.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdatePublicationInput) {
		const existing = await prisma.publication.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Publication", id);
		}

		if (data.title) {
			const duplicate = await prisma.publication.findFirst({
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
					"PROFILE_PUBLICATION_ALREADY_EXISTS",
					"This publication already exists for this Profile.",
				);
			}
		}

		validateTimeline(
			data.start ?? existing.start,
			data.end !== undefined ? data.end : existing.end,
			null,
		);

		const dataToUpdate = {
			title: data.title ?? existing.title,
			description: data.description ?? existing.description,
			journalName: data.journalName ?? existing.journalName,
			url: data.url ?? existing.url,
			start: data.start ?? existing.start,
			end: data.end !== undefined ? data.end : existing.end,
		};

		return prisma.publication.update({
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

		const publication = await prisma.publication.findUnique({
			where: {
				id,
			},
		});

		if (!publication) {
			throw new NotFoundError("Profile Publication", id);
		}

		if (publication.order === newOrder) {
			return publication;
		}

		return prisma.$transaction(async (tx) => {
			const publications = await tx.publication.findMany({
				where: {
					profileId: publication.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(publications, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.publication.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.publication.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.publication.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const publication = await prisma.publication.findUnique({
			where: {
				id,
			},
		});

		if (!publication) {
			throw new NotFoundError("Profile Publication", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.publication.delete({
				where: {
					id,
				},
			});

			const publications = await tx.publication.findMany({
				where: {
					profileId: publication.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(publications);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.publication.update({
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
				await tx.publication.update({
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

export const profilePublicationService = new ProfilePublicationService();
