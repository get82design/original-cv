import { prisma } from "../../../lib/prisma";
import type { CreateProfileDto } from "../dto/CreateProfileDto";
import type { UpdateProfileDto } from "../dto/UpdateProfileDto";
import { ConflictError, NotFoundError } from "../errors";

export class ProfileService {
	// CREATE
	async create(userId: string, data: CreateProfileDto) {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		const existingProfile = await prisma.profile.findUnique({
			where: {
				userId,
			},
		});

		if (existingProfile) {
			throw new ConflictError("Profile already exists");
		}

		return prisma.profile.create({
			data: {
				userId,
				...data,
			},
		});
	}

	// FIND BY USER ID
	async findByUserId(userId: string) {
		return prisma.profile.findUnique({
			where: {
				userId,
			},
		});
	}

	// FIND COMPLETE PROFILE BY USER ID
	async findCompleteByUserId(userId: string) {
		return prisma.profile.findUnique({
			where: {
				userId,
			},
			include: {
				description: true,
				skills: {
					include: {
						skills: true,
					},
				},
				experiences: {
					include: {
						missions: true,
					},
				},
				educations: true,
				achievements: true,
				strengths: true,
				volunteerings: {
					include: {
						missions: true,
					},
				},
				projects: {
					include: {
						missions: true,
					},
				},
				publications: true,
				languages: true,
				passions: true,
				socialMedias: true,
				philosophy: true,
				expertises: true,
				prices: true,
				certifications: true,
				formations: true,
				competences: {
					include: {
						competences: true,
					},
				},
			},
		});
	}

	// UPDATE
	async update(userId: string, data: UpdateProfileDto) {
		const profile = await prisma.profile.findUnique({
			where: {
				userId,
			},
		});

		if (!profile) {
			throw new NotFoundError("Profile", userId);
		}

		return prisma.profile.update({
			where: {
				userId,
			},
			data,
		});
	}

	// DELETE
	async delete(userId: string) {
		const profile = await prisma.profile.findUnique({
			where: {
				userId,
			},
		});

		if (!profile) {
			throw new NotFoundError("Profile", userId);
		}

		return prisma.profile.delete({
			where: {
				userId,
			},
		});
	}
}

export const profileService = new ProfileService();
