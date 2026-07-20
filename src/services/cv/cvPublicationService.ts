import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import type {
	CreateCvPublicationDto,
	UpdateCvPublicationDto,
} from "../dto/CvPublicationDto";
import { ConflictError, NotFoundError } from "../errors";

export class CvPublicationService {
	async create(cvId: string, data: CreateCvPublicationDto) {
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

		const existingPublication = await prisma.cvPublication.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingPublication) {
			throw new ConflictError(
				"CV_PUBLICATION_ALREADY_EXISTS",
				"This publication already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvPublication.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_PUBLICATION_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		validateTimeline(data.start, data.end, null);

		return prisma.cvPublication.create({
			data: {
				cvId,
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

	async findAllByCvId(cvId: string) {
		return prisma.cvPublication.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvPublicationDto) {
		const existing = await prisma.cvPublication.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Publication", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvPublication.findFirst({
				where: {
					cvId: existing.cvId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_PUBLICATION_ALREADY_EXISTS",
					"This publication already exists for this CV.",
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

		return prisma.cvPublication.update({
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

		const publication = await prisma.cvPublication.findUnique({
			where: {
				id,
			},
		});

		if (!publication) {
			throw new NotFoundError("CV Publication", id);
		}

		if (publication.order === newOrder) {
			return publication;
		}

		return prisma.$transaction(async (tx) => {
			const publications = await tx.cvPublication.findMany({
				where: {
					cvId: publication.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(publications, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvPublication.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvPublication.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvPublication.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const publication = await prisma.cvPublication.findUnique({
			where: {
				id,
			},
		});

		if (!publication) {
			throw new NotFoundError("CV Publication", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvPublication.delete({
				where: {
					id,
				},
			});

			const publications = await tx.cvPublication.findMany({
				where: {
					cvId: publication.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(publications);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvPublication.update({
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
				await tx.cvPublication.update({
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

export const cvPublicationService = new CvPublicationService();
