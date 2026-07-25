import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type {
	CreateCertificationInput,
	UpdateCertificationInput,
} from "../schemas/certification.schema";

export class CvCertificationService {
	async create(cvId: string, data: CreateCertificationInput) {
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

		const existingNetwork = await prisma.cvCertification.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingNetwork) {
			throw new ConflictError(
				"CV_CERTIFICATION_ALREADY_EXISTS",
				"This certification already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvCertification.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_CERTIFICATION_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cvCertification.create({
			data: {
				cvId,
				title: data.title,
				organismeCertification: data.organismeCertification,
				settings: data.settings ?? {},
				order: data.order ?? 0,
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvCertification.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCertificationInput) {
		const existing = await prisma.cvCertification.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Certification", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvCertification.findFirst({
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
					"CV_CERTIFICATION_ALREADY_EXISTS",
					"This certification already exists for this CV.",
				);
			}
		}

		return prisma.cvCertification.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.organismeCertification !== undefined
					? { organismeCertification: data.organismeCertification }
					: {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const certification = await prisma.cvCertification.findUnique({
			where: {
				id,
			},
		});

		if (!certification) {
			throw new NotFoundError("CV Certification", id);
		}

		if (certification.order === newOrder) {
			return certification;
		}

		return prisma.$transaction(async (tx) => {
			const certifications = await tx.cvCertification.findMany({
				where: {
					cvId: certification.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(certifications, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvCertification.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvCertification.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvCertification.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const certification = await prisma.cvCertification.findUnique({
			where: {
				id,
			},
		});

		if (!certification) {
			throw new NotFoundError("CV Certification", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvCertification.delete({
				where: {
					id,
				},
			});

			const certifications = await tx.cvCertification.findMany({
				where: {
					cvId: certification.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(certifications);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvCertification.update({
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
				await tx.cvCertification.update({
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

export const cvCertificationService = new CvCertificationService();
