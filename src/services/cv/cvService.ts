import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { parseDataImageUrl } from "../storage/parseDataImageUrl";
import { getPreviewStorage } from "../storage/previewStorage";
import { AppError } from "../errors/AppError";
import type { CreateCvInput, UpdateCvInput } from "../schemas/cv.schema";
import { templateAccessService } from "../commons/templateAccessService";
import { userService } from "../user/userService";
import { extractPrimaryColorName } from "./extractPrimaryColorName";

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

		await templateAccessService.assertCanUseTemplate(data.userId, data.templateId);

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

		const primaryColorName = extractPrimaryColorName(template.defaultStyles);

		return prisma.cV.create({
			data: {
				...data,
				primaryColorName,
			},
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
				stats: true,
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

		if (data.templateId !== undefined) {
			await templateAccessService.assertCanUseTemplate(userId, data.templateId);
		}

		return prisma.cV.update({
			where: {
				id: cvId,
			},
			data: {
				...(data.templateId !== undefined ? { templateId: data.templateId } : {}),
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
				template: {
					select: {
						name: true,
						isPremium: true,
						priceCents: true,
						priceCredits: true,
					},
				},
				userId: true,
				createdAt: true,
				updatedAt: true,
				previewUrl: true,
				previewUrlClean: true,
				primaryColorName: true,
			},
		});
	}

	async setPreview(cvId: string, userId: string, previewUrl: string, previewUrlClean: string) {
		const cv = await prisma.cV.findUnique({
			where: { id: cvId },
			select: {
				id: true,
				userId: true,
				previewUrl: true,
				previewUrlClean: true,
			},
		});

		if (!cv) {
			throw new NotFoundError("CV", cvId);
		}

		if (cv.userId !== userId) {
			throw new ForbiddenError("You cannot update this CV");
		}

		const withLogo = parseDataImageUrl(previewUrl);
		const clean = parseDataImageUrl(previewUrlClean);
		const storage = getPreviewStorage();

		const [storedWith, storedClean] = await Promise.all([
			storage.put({
				key: `${userId}/${cvId}-with.${withLogo.ext}`,
				body: withLogo.buffer,
				contentType: withLogo.mimeType,
			}),
			storage.put({
				key: `${userId}/${cvId}-clean.${clean.ext}`,
				body: clean.buffer,
				contentType: clean.mimeType,
			}),
		]);

		const updated = await prisma.cV.update({
			where: { id: cvId },
			data: {
				previewUrl: storedWith.publicUrl,
				previewUrlClean: storedClean.publicUrl,
			},
			select: { id: true, previewUrl: true, previewUrlClean: true },
		});

		// Ne supprimer que si la clé objet change (ignorer ?v= cache-bust).
		await Promise.all([
			previewObjectKey(cv.previewUrl) !== previewObjectKey(storedWith.publicUrl)
				? storage.deleteIfManaged(cv.previewUrl)
				: Promise.resolve(),
			previewObjectKey(cv.previewUrlClean) !==
			previewObjectKey(storedClean.publicUrl)
				? storage.deleteIfManaged(cv.previewUrlClean)
				: Promise.resolve(),
		]);

		return updated;
	}
}

function previewObjectKey(url: string | null | undefined): string | null {
	if (!url) return null;
	try {
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return new URL(url).pathname;
		}
		return url.split("?")[0] ?? null;
	} catch {
		return url.split("?")[0] ?? null;
	}
}

export const cvService = new CvService();
