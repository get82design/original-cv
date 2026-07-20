import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import type {
	CreateCvExperienceDto,
	UpdateCvExperienceDto,
} from "../dto/CvExperienceDto";
import { ConflictError, NotFoundError } from "../errors";

export class CvExperienceService {
	async create(cvId: string, data: CreateCvExperienceDto) {
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

		const existingExperience = await prisma.cvExperience.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingExperience) {
			throw new ConflictError(
				"CV_EXPERIENCE_ALREADY_EXISTS",
				"This experience already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvExperience.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_EXPERIENCE_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		validateTimeline(data.start, data.end);

		return prisma.cvExperience.create({
			data: {
				cvId,
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

	async findAllByCvId(cvId: string) {
		return prisma.cvExperience.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvExperienceDto) {
		const existing = await prisma.cvExperience.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Experience", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvExperience.findFirst({
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
					"CV_EXPERIENCE_ALREADY_EXISTS",
					"This experience already exists for this CV.",
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

		return prisma.cvExperience.update({
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

		const experience = await prisma.cvExperience.findUnique({
			where: {
				id,
			},
		});

		if (!experience) {
			throw new NotFoundError("CV Experience", id);
		}

		if (experience.order === newOrder) {
			return experience;
		}

		return prisma.$transaction(async (tx) => {
			const experiences = await tx.cvExperience.findMany({
				where: {
					cvId: experience.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(experiences, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvExperience.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvExperience.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvExperience.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const experience = await prisma.cvExperience.findUnique({
			where: {
				id,
			},
		});

		if (!experience) {
			throw new NotFoundError("CV Experience", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvExperience.delete({
				where: {
					id,
				},
			});

			const experiences = await tx.cvExperience.findMany({
				where: {
					cvId: experience.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(experiences);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvExperience.update({
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
				await tx.cvExperience.update({
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

export const cvExperienceService = new CvExperienceService();
