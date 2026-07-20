import { prisma } from "../../../lib/prisma";
import type {
	CreateCvPhilosophyDto,
	UpdateCvPhilosophyDto,
} from "../dto/CvPhilosophyDto";
import { ConflictError, NotFoundError } from "../errors";

export class ProfilePhilosophyService {
	// CRÉATION
	async create(profileId: string, data: CreateCvPhilosophyDto) {
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

		const existing = await prisma.philosophy.findUnique({
			where: {
				profileId,
			},
		});

		if (existing) {
			throw new ConflictError(
				"PROFILE_PHILOSOPHY_ALREADY_EXISTS",
				"This Profile already has a philosophy.",
			);
		}

		return prisma.philosophy.create({
			data: {
				profileId,
				citation: data.citation,
				author: data.author ?? null,
			},
		});
	}

	// RECHERCHE
	async findByProfileId(profileId: string) {
		const philosophy = await prisma.philosophy.findUnique({
			where: {
				profileId,
			},
		});

		if (!philosophy) {
			throw new NotFoundError("Profile Philosophy", profileId);
		}

		return philosophy;
	}

	// MISE À JOUR
	async update(profileId: string, data: UpdateCvPhilosophyDto) {
		const philosophy = await prisma.philosophy.findUnique({
			where: {
				profileId,
			},
		});

		if (!philosophy) {
			throw new NotFoundError("Profile Philosophy", profileId);
		}

		return prisma.philosophy.update({
			where: {
				profileId,
			},
			data,
		});
	}

	async delete(profileId: string) {
		const philosophy = await prisma.philosophy.findUnique({
			where: {
				profileId,
			},
		});

		if (!philosophy) {
			throw new NotFoundError("Profile Philosophy", profileId);
		}

		await prisma.philosophy.delete({
			where: {
				profileId,
			},
		});
	}
}

export const profilePhilosophyService = new ProfilePhilosophyService();
