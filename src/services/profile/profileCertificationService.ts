import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type {
	CreateCertificationInput,
	UpdateCertificationInput,
} from "../schemas/certification.schema";

export class ProfileCertificationService {
	async create(profileId: string, data: CreateCertificationInput) {
		const profile = await prisma.profile.findUnique({
			where: {
				id: profileId,
			},
		});

		if (!profile) {
			throw new NotFoundError("Profile", profileId);
		}

		const existingCertification = await prisma.certification.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingCertification) {
			throw new ConflictError(
				"PROFILE_CERTIFICATION_ALREADY_EXISTS",
				"This certification already exists for this profile.",
			);
		}

		const existingOrder = await prisma.certification.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_CERTIFICATION_ORDER_ALREADY_EXISTS",
				"This order is already used for this profile.",
			);
		}

		return prisma.certification.create({
			data: {
				profileId,
				title: data.title,
				organismeCertification: data.organismeCertification,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.certification.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCertificationInput) {
		const existing = await prisma.certification.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Certification", id);
		}

		if (data.title) {
			const duplicate = await prisma.certification.findFirst({
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
					"PROFILE_CERTIFICATION_ALREADY_EXISTS",
					"This certification already exists for this profile.",
				);
			}
		}

		return prisma.certification.update({
			where: {
				id,
			},
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.organismeCertification !== undefined
					? { organismeCertification: data.organismeCertification }
					: {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const certification = await prisma.certification.findUnique({
			where: {
				id,
			},
		});

		if (!certification) {
			throw new NotFoundError("Profile Certification", id);
		}

		if (certification.order === newOrder) {
			return certification;
		}

		return prisma.$transaction(async (tx) => {
			const certifications = await tx.certification.findMany({
				where: {
					profileId: certification.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(certifications, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.certification.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.certification.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.certification.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const certification = await prisma.certification.findUnique({
			where: {
				id,
			},
		});

		if (!certification) {
			throw new NotFoundError("Profile Certification", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.certification.delete({
				where: {
					id,
				},
			});

			const certifications = await tx.certification.findMany({
				where: {
					profileId: certification.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(certifications);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.certification.update({
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
				await tx.certification.update({
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

export const profileCertificationService = new ProfileCertificationService();
