import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateDescriptionInput,
	UpdateDescriptionInput,
} from "../schemas/description.schema";

export class CvDescriptionService {
	async create(cvId: string, data: CreateDescriptionInput) {
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

		const existingDescription = await prisma.cvDescription.findUnique({
			where: {
				cvId,
			},
		});

		if (existingDescription) {
			throw new ConflictError(
				"CV_DESCRIPTION_ALREADY_EXISTS",
				"This CV already has a description.",
			);
		}

		return prisma.cvDescription.create({
			data: {
				cvId,
				description: data.description,
			},
		});
	}

	// FIND BY CV ID
	async findByCvId(cvId: string) {
		const description = await prisma.cvDescription.findUnique({
			where: {
				cvId,
			},
		});

		if (!description) {
			throw new NotFoundError("CV Description", cvId);
		}

		return description;
	}

	// UPDATE
	async update(cvId: string, data: UpdateDescriptionInput) {
		const existing = await prisma.cvDescription.findUnique({
			where: {
				cvId,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Description", cvId);
		}

		return prisma.cvDescription.update({
			where: {
				cvId,
			},
			data: {
				...(data.description !== undefined
					? { description: data.description }
					: {}),
			},
		});
	}

	// DELETE
	async delete(cvId: string) {
		const existing = await prisma.cvDescription.findUnique({
			where: {
				cvId,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Description", cvId);
		}

		await prisma.cvDescription.delete({
			where: {
				cvId,
			},
		});
	}
}

export const cvDescriptionService = new CvDescriptionService();
