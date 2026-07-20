import { prisma } from "../../../lib/prisma";
import type {
	CreateCvDescriptionDto,
	UpdateCvDescriptionDto,
} from "../dto/CvDescriptionDto";
import { ConflictError, NotFoundError } from "../errors";

export class ProfileDescriptionService {
	async create(profileId: string, data: CreateCvDescriptionDto) {
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

		const existingDescription = await prisma.description.findUnique({
			where: {
				profileId,
			},
		});

		if (existingDescription) {
			throw new ConflictError(
				"PROFILE_DESCRIPTION_ALREADY_EXISTS",
				"This profile already has a description.",
			);
		}

		return prisma.description.create({
			data: {
				profileId,
				description: data.description,
			},
		});
	}

	// FIND BY PROFILE ID
	async findByProfileId(profileId: string) {
		const description = await prisma.description.findUnique({
			where: {
				profileId,
			},
		});

		if (!description) {
			throw new NotFoundError("Profile Description", profileId);
		}

		return description;
	}

	// UPDATE
	async update(profileId: string, data: UpdateCvDescriptionDto) {
		const existing = await prisma.description.findUnique({
			where: {
				profileId,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Description", profileId);
		}

		return prisma.description.update({
			where: {
				profileId,
			},
			data,
		});
	}

	// DELETE
	async delete(profileId: string) {
		const existing = await prisma.description.findUnique({
			where: {
				profileId,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Description", profileId);
		}

		await prisma.description.delete({
			where: {
				profileId,
			},
		});
	}
}

export const profileDescriptionService = new ProfileDescriptionService();
