import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";
import type { CreateSocialMediaInput, UpdateSocialMediaInput } from "../schemas/socialMedia.schema";

export class CvSocialMediaService {
	async create(cvId: string, data: CreateSocialMediaInput) {
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

		const existingNetwork = await prisma.cvSocialMedia.findUnique({
			where: {
				cvId_socialNetwork: {
					cvId,
					socialNetwork: data.socialNetwork,
				},
			},
		});

		if (existingNetwork) {
			throw new ConflictError(
				"CV_SOCIAL_MEDIA_ALREADY_EXISTS",
				"This social network already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvSocialMedia.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_SOCIAL_MEDIA_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cvSocialMedia.create({
			data: {
				cvId,
				socialNetwork: data.socialNetwork,
				username: data.username,
				icon: data.icon,
				order: data.order ?? 0,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvSocialMedia.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateSocialMediaInput) {
		const existing = await prisma.cvSocialMedia.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Social Media", id);
		}

		if (data.socialNetwork) {
			const duplicate = await prisma.cvSocialMedia.findFirst({
				where: {
					cvId: existing.cvId,
					socialNetwork: data.socialNetwork,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_SOCIAL_MEDIA_ALREADY_EXISTS",
					"This social network already exists for this CV.",
				);
			}
		}

		return prisma.cvSocialMedia.update({
			where: {
				id,
			},
			data: {
				...(data.socialNetwork !== undefined ? { socialNetwork: data.socialNetwork } : {}),
				...(data.username !== undefined ? { username: data.username } : {}),
				...(data.icon !== undefined ? { icon: data.icon } : {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const socialMedia = await prisma.cvSocialMedia.findUnique({
			where: {
				id,
			},
		});

		if (!socialMedia) {
			throw new NotFoundError("CV Social Media", id);
		}

		if (socialMedia.order === newOrder) {
			return socialMedia;
		}

		return prisma.$transaction(async (tx) => {
			const socialMedias = await tx.cvSocialMedia.findMany({
				where: {
					cvId: socialMedia.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(socialMedias, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvSocialMedia.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvSocialMedia.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvSocialMedia.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const socialMedia = await prisma.cvSocialMedia.findUnique({
			where: {
				id,
			},
		});

		if (!socialMedia) {
			throw new NotFoundError("CV Social Media", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvSocialMedia.delete({
				where: {
					id,
				},
			});

			const socialMedias = await tx.cvSocialMedia.findMany({
				where: {
					cvId: socialMedia.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(socialMedias);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvSocialMedia.update({
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
				await tx.cvSocialMedia.update({
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

export const cvSocialMediaService = new CvSocialMediaService();
