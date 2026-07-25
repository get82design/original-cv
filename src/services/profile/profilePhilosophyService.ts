import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreatePhilosophyInput,
	UpdatePhilosophyInput,
} from "../schemas/philosophy.schema";

export class ProfilePhilosophyService {
	// CRÉATION
	async create(profileId: string, data: CreatePhilosophyInput) {
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
	async update(profileId: string, data: UpdatePhilosophyInput) {
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
			data: {
				...(data.citation !== undefined ? { citation: data.citation } : {}),
				...(data.author !== undefined ? { author: data.author } : {}),
			},
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
