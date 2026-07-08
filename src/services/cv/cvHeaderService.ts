import { prisma } from "../../../lib/prisma";
import type { CreateCvHeaderDto } from "../dto/CreateCvHeaderDto";
import type { UpdateCvHeaderDto } from "../dto/UpdateCvHeaderDto";
import { ConflictError, NotFoundError } from "../errors";

export class CvHeaderService {
	async create(cvId: string, data: CreateCvHeaderDto) {
		// Vérifie que le CV existe
		const cv = await prisma.cV.findUnique({
			where: { id: cvId },
			select: { id: true },
		});

		if (!cv) {
			throw new NotFoundError("CV", cvId);
		}

		// Un seul header par CV
		const existingHeader = await prisma.cvHeader.findUnique({
			where: {
				cvId,
			},
		});

		if (existingHeader) {
			throw new ConflictError(
				"CV_HEADER_ALREADY_EXISTS",
				"This CV already has a header.",
			);
		}

		return prisma.cvHeader.create({
			data: {
				cvId,
				title: data?.title,
				prenom: data?.prenom ?? null,
				nom: data?.nom ?? null,
				email: data?.email ?? null,
				phone: data?.phone ?? null,
				portfolio: data?.portfolio ?? null,
				location: data?.location ?? null,
				subtitle: data?.subtitle ?? null,
			},
		});
	}

	// FIND BY CV ID
	async findByCvId(cvId: string) {
		const header = await prisma.cvHeader.findUnique({
			where: {
				cvId,
			},
		});
		if (!header) {
			throw new NotFoundError("CV Header", cvId);
		}
		return header;
	}

	// UPDATE
	async update(cvId: string, data: UpdateCvHeaderDto) {
		const header = await prisma.cvHeader.findUnique({
			where: {
				cvId,
			},
		});
		if (!header) {
			throw new NotFoundError("CV Header", cvId);
		}
		return prisma.cvHeader.update({
			where: {
				cvId,
			},
			data,
		});
	}

	// DELETE
	async delete(cvId: string) {
		const header = await prisma.cvHeader.findUnique({
			where: {
				cvId,
			},
		});
		if (!header) {
			throw new NotFoundError("CV Header", cvId);
		}
		await prisma.cvHeader.delete({
			where: {
				cvId,
			},
		});
	}
}

export const cvHeaderService = new CvHeaderService();
