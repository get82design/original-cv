import { prisma } from "../../../lib/prisma";
import type { CreateProfileInput, UpdateProfileInput } from "../schemas/profile.schema";
import { ConflictError, NotFoundError } from "../errors";

export class ProfileService {
	// CREATE
	async create(userId: string, data: CreateProfileInput) {
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
				firstName: data.firstName,
				lastName: data.lastName,
				...(data.phone !== undefined ? { phone: data.phone } : {}),
				...(data.location !== undefined ? { location: data.location } : {}),
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
						skills: {
							include: { skill: true },
							orderBy: { order: "asc" },
						},
					},
					orderBy: { order: "asc" },
				},
				tags: {
					include: {
						tags: {
							include: { tag: true },
							orderBy: { order: "asc" },
						},
					},
					orderBy: { order: "asc" },
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
				prizes: true,
				certifications: true,
				formations: true,
				competences: {
					include: {
						competences: {
							include: { competence: true },
							orderBy: { order: "asc" },
						},
					},
					orderBy: { order: "asc" },
				},
			},
		});
	}

	// UPDATE
	async update(userId: string, data: UpdateProfileInput) {
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
			data: {
				...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
				...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
				...(data.phone !== undefined ? { phone: data.phone } : {}),
				...(data.location !== undefined ? { location: data.location } : {}),
			},
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
