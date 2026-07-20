import { prisma } from "../../../lib/prisma";
import { reorderItems } from "../../utils/reorderCvItems";
import type {
	CreateCvSocialMediaDto,
	UpdateCvSocialMediaDto,
} from "../dto/CvSocialMediaDto";
import { ConflictError, NotFoundError } from "../errors";
import { compactOrder } from "../../utils/compactOrder";

export class ProfileSocialMediaService {
	async create(profileId: string, data: CreateCvSocialMediaDto) {
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

		const existingNetwork = await prisma.socialMedia.findUnique({
			where: {
				profileId_socialNetwork: {
					profileId,
					socialNetwork: data.socialNetwork,
				},
			},
		});

		if (existingNetwork) {
			throw new ConflictError(
				"PROFILE_SOCIAL_MEDIA_ALREADY_EXISTS",
				"This social network already exists for this Profile.",
			);
		}

		const existingOrder = await prisma.socialMedia.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order ?? 0,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_SOCIAL_MEDIA_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		return prisma.socialMedia.create({
			data: {
				profileId,
				socialNetwork: data.socialNetwork,
				username: data.username,
				order: data.order ?? 0,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.socialMedia.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvSocialMediaDto) {
		const existing = await prisma.socialMedia.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Social Media", id);
		}

		if (data.socialNetwork) {
			const duplicate = await prisma.socialMedia.findFirst({
				where: {
					profileId: existing.profileId,
					socialNetwork: data.socialNetwork,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"PROFILE_SOCIAL_MEDIA_ALREADY_EXISTS",
					"This social network already exists for this Profile.",
				);
			}
		}

		return prisma.socialMedia.update({
			where: {
				id,
			},
			data,
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const socialMedia = await prisma.socialMedia.findUnique({
			where: {
				id,
			},
		});

		if (!socialMedia) {
			throw new NotFoundError("Profile Social Media", id);
		}

		if (socialMedia.order === newOrder) {
			return socialMedia;
		}

		return prisma.$transaction(async (tx) => {
			const socialMedias = await tx.socialMedia.findMany({
				where: {
					profileId: socialMedia.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(socialMedias, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.socialMedia.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.socialMedia.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.socialMedia.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const socialMedia = await prisma.socialMedia.findUnique({
			where: {
				id,
			},
		});

		if (!socialMedia) {
			throw new NotFoundError("Profile Social Media", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.socialMedia.delete({
				where: {
					id,
				},
			});

			const socialMedias = await tx.socialMedia.findMany({
				where: {
					profileId: socialMedia.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(socialMedias);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.socialMedia.update({
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
				await tx.socialMedia.update({
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

export const profileSocialMediaService = new ProfileSocialMediaService();
