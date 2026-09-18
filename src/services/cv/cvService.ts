import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { AppError } from "../errors/AppError";
import type { CreateCvInput, UpdateCvInput } from "../schemas/cv.schema";
import { userService } from "../user/userService";

export class CvService {
	// CREATE
	async create(data: CreateCvInput) {
		const user = await prisma.user.findUnique({
			where: {
				id: data.userId,
			},
		});

		if (!user) {
			throw new NotFoundError("User");
		}

		const canCreate = await userService.canCreateCv(data.userId);
		if (!canCreate) {
			throw new ValidationError(`Limite de CV atteinte (${user.maxCvs})`);
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
				tagGroups: {
					include: {
						tags: { include: { tag: true } },
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
				prizes: true,
				certifications: true,
				formations: true,
				modules: { orderBy: { order: "asc" } },
			},
		});

		if (!cv) {
			throw new NotFoundError("CV", id);
		}

		return cv;
	}

	// UPDATE
	async update(cvId: string, userId: string, data: UpdateCvInput) {
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
			data: {
				...(data.templateId !== undefined
					? { templateId: data.templateId }
					: {}),
				...(data.title !== undefined ? { title: data.title } : {}),
			},
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

	async findAllByUser(userId: string) {
		return prisma.cV.findMany({
			where: { userId },
			orderBy: { updatedAt: "desc" },
			select: {
				id: true,
				title: true,
				photo: true,
				templateId: true,
				template: { select: { name: true } },
				userId: true,
				createdAt: true,
				updatedAt: true,
				previewUrl: true,
				previewUrlClean: true,
			},
		});
	}

	async setPreview(
		cvId: string,
		userId: string,
		previewUrl: string,
		previewUrlClean: string,
	) {
		const cv = await prisma.cV.findUnique({
			where: { id: cvId },
			select: { id: true, userId: true },
		});

		if (!cv) {
			throw new NotFoundError("CV", cvId);
		}

		if (cv.userId !== userId) {
			throw new ForbiddenError("You cannot update this CV");
		}

		return prisma.cV.update({
			where: { id: cvId },
			data: { previewUrl, previewUrlClean },
			select: { id: true, previewUrl: true, previewUrlClean: true },
		});
	}
}

export const cvService = new CvService();
