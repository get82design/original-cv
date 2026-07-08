import { prisma } from "../../../lib/prisma";
import type { CreateCvDto } from "../dto/CreateCvDto";
import type { UpdateCvDto } from "../dto/UpdateCvDto";
import { ForbiddenError, NotFoundError } from "../errors";
import { AppError } from "../errors/AppError";

export class CvService {
	// CREATE
	async create(data: CreateCvDto) {
		const user = await prisma.user.findUnique({
			where: {
				id: data.userId,
			},
		});

		if (!user) {
			throw new NotFoundError("User");
		}

		const template = await prisma.cVTemplate.findUnique({
			where: {
				id: data.templateId,
			},
		});

		if (!template) {
			throw new NotFoundError("Template");
		}

		const existing = await prisma.cV.findFirst({
			where: {
				userId: data.userId,
				title: data.title,
				templateId: data.templateId,
			},
		});

		if (existing) {
			throw new AppError("CV_ALREADY_EXISTS", "Le CV existe déjà");
		}

		return prisma.cV.create({
			data,
		});
	}

	// FINDBYID
	async findById(id: string) {
		const cv = await prisma.cV.findUnique({
			where: { id },
			include: {
				headerCv: true,
				description: true,
				skillGroups: {
					include: {
						skills: {
							include: { skill: true },
						},
					},
				},
				competences: {
					include: {
						cvCompetences: {
							include: { competence: true },
						},
					},
				},
				experiences: {
					include: {
						cvMissions: true,
					},
				},
				educations: true,
				achievements: true,
				strengths: true,
				volunteerings: { include: { cvMissions: true } },
				projects: { include: { cvMissions: true } },
				publications: true,
				languages: true,
				passions: true,
				socialMedias: true,
				philosophy: true,
				expertises: true,
				prices: true,
				certifications: true,
				formations: true,
			},
		});

		if (!cv) {
			throw new NotFoundError("CV", id);
		}

		return cv;
	}

	// UPDATE
	async update(cvId: string, userId: string, data: UpdateCvDto) {
		const cv = await prisma.cV.findUnique({
			where: {
				id: cvId,
			},
			select: {
				id: true,
				userId: true,
			},
		});

		if (!cv) {
			throw new NotFoundError("CV", cvId);
		}

		if (cv.userId !== userId) {
			throw new ForbiddenError("You cannot update this CV");
		}

		return prisma.cV.update({
			where: {
				id: cvId,
			},
			data,
		});
	}

	// DELETE
	async delete(cvId: string, userId: string) {
		const cv = await prisma.cV.findUnique({
			where: {
				id: cvId,
			},
			select: {
				id: true,
				userId: true,
			},
		});

		if (!cv) {
			throw new NotFoundError("CV", cvId);
		}

		if (cv.userId !== userId) {
			throw new ForbiddenError("You cannot delete this CV");
		}

		return prisma.cV.delete({
			where: {
				id: cvId,
			},
		});
	}
}

export const cvService = new CvService();
