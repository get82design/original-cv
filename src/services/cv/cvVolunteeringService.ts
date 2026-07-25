import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateVolunteeringInput,
	UpdateVolunteeringInput,
} from "../schemas/volunteering.schema";

export class CvVolunteeringService {
	async create(cvId: string, data: CreateVolunteeringInput) {
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

		const existingVolunteering = await prisma.cvVolunteering.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingVolunteering) {
			throw new ConflictError(
				"CV_VOLUNTEERING_ALREADY_EXISTS",
				"This volunteering already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvVolunteering.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_VOLUNTEERING_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		validateTimeline(data.start, data.end);

		return prisma.cvVolunteering.create({
			data: {
				cvId,
				title: data.title,
				organisation: data.organisation,
				description: data.description ?? null,
				location: data.location ?? null,
				start: data.start,
				end: data.end ?? null,
				order: data.order,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvVolunteering.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateVolunteeringInput) {
		const existing = await prisma.cvVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Volunteering", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvVolunteering.findFirst({
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
					"CV_VOLUNTEERING_ALREADY_EXISTS",
					"This volunteering already exists for this CV.",
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
			settings: data.settings ?? existing.settings ?? {},
		};

		return prisma.cvVolunteering.update({
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

		const volunteering = await prisma.cvVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!volunteering) {
			throw new NotFoundError("CV Volunteering", id);
		}

		if (volunteering.order === newOrder) {
			return volunteering;
		}

		return prisma.$transaction(async (tx) => {
			const volunteerings = await tx.cvVolunteering.findMany({
				where: {
					cvId: volunteering.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(volunteerings, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvVolunteering.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvVolunteering.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvVolunteering.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const volunteering = await prisma.cvVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!volunteering) {
			throw new NotFoundError("CV Volunteering", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvVolunteering.delete({
				where: {
					id,
				},
			});

			const volunteerings = await tx.cvVolunteering.findMany({
				where: {
					cvId: volunteering.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(volunteerings);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvVolunteering.update({
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
				await tx.cvVolunteering.update({
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

export const cvVolunteeringService = new CvVolunteeringService();
