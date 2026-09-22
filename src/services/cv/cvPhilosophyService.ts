import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type { CreatePhilosophyInput, UpdatePhilosophyInput } from "../schemas/philosophy.schema";

export class CvPhilosophyService {
	// CRÉATION
	async create(cvId: string, data: CreatePhilosophyInput) {
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

		const existing = await prisma.cvPhilosophy.findUnique({
			where: {
				cvId,
			},
		});

		if (existing) {
			throw new ConflictError("CV_PHILOSOPHY_ALREADY_EXISTS", "This CV already has a philosophy.");
		}

		return prisma.cvPhilosophy.create({
			data: {
				cvId,
				citation: data.citation,
				author: data.author ?? null,
				settings: data.settings ?? {},
			},
		});
	}

	// RECHERCHE
	async findByCvId(cvId: string) {
		const philosophy = await prisma.cvPhilosophy.findUnique({
			where: {
				cvId,
			},
		});

		if (!philosophy) {
			throw new NotFoundError("CV Philosophy", cvId);
		}

		return philosophy;
	}

	// MISE À JOUR
	async update(cvId: string, data: UpdatePhilosophyInput) {
		const philosophy = await prisma.cvPhilosophy.findUnique({
			where: {
				cvId,
			},
		});

		if (!philosophy) {
			throw new NotFoundError("CV Philosophy", cvId);
		}

		return prisma.cvPhilosophy.update({
			where: {
				cvId,
			},
			data: {
				...(data.citation !== undefined ? { citation: data.citation } : {}),
				...(data.author !== undefined ? { author: data.author } : {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
			},
		});
	}

	async delete(cvId: string) {
		const philosophy = await prisma.cvPhilosophy.findUnique({
			where: {
				cvId,
			},
		});

		if (!philosophy) {
			throw new NotFoundError("CV Philosophy", cvId);
		}

		await prisma.cvPhilosophy.delete({
			where: {
				cvId,
			},
		});
	}
}

export const cvPhilosophyService = new CvPhilosophyService();
