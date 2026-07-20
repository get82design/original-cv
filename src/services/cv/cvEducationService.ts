import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import type {
	CreateCvEducationDto,
	UpdateCvEducationDto,
} from "../dto/CvEducationDto";
import { ConflictError, NotFoundError } from "../errors";

export class CvEducationService {
	async create(cvId: string, data: CreateCvEducationDto) {
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

		const existingEducation = await prisma.cvEducation.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title ?? "",
				},
			},
		});

		if (existingEducation) {
			throw new ConflictError(
				"CV_EDUCATION_ALREADY_EXISTS",
				"This education already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvEducation.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_EDUCATION_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		validateTimeline(data.start, data.end, data.obtained);

		return prisma.cvEducation.create({
			data: {
				cvId,
				title: data.title,
				start: data.start,
				end: data.end ?? null,
				obtained: data.obtained ?? null,
				order: data.order,
				school: data.school,
				city: data.city ?? null,
				degree: data.degree,
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvEducation.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvEducationDto) {
		const existing = await prisma.cvEducation.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Education", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvEducation.findFirst({
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
					"CV_EDUCATION_ALREADY_EXISTS",
					"This education already exists for this CV.",
				);
			}
		}

		validateTimeline(
			data.start ?? existing.start,
			data.end !== undefined ? data.end : existing.end,
			data.obtained !== undefined ? data.obtained : existing.obtained,
		);

		const dataToUpdate = {
			title: data.title ?? existing.title,
			start: data.start ?? existing.start,
			end: data.end !== undefined ? data.end : existing.end,
			obtained: data.obtained !== undefined ? data.obtained : existing.obtained,
			degree: data.degree ?? existing.degree,
			school: data.school ?? existing.school,
			city: data.city ?? existing.city,
		};

		return prisma.cvEducation.update({
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

		const education = await prisma.cvEducation.findUnique({
			where: {
				id,
			},
		});

		if (!education) {
			throw new NotFoundError("CV Education", id);
		}

		if (education.order === newOrder) {
			return education;
		}

		return prisma.$transaction(async (tx) => {
			const educations = await tx.cvEducation.findMany({
				where: {
					cvId: education.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(educations, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvEducation.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvEducation.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvEducation.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const education = await prisma.cvEducation.findUnique({
			where: {
				id,
			},
		});

		if (!education) {
			throw new NotFoundError("CV Education", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvEducation.delete({
				where: {
					id,
				},
			});

			const educations = await tx.cvEducation.findMany({
				where: {
					cvId: education.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(educations);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvEducation.update({
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
				await tx.cvEducation.update({
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

export const cvEducationService = new CvEducationService();
