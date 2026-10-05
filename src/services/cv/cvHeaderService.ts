import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type { CreateCvHeaderInput, UpdateCvHeaderInput } from "../schemas/cvHeader.schema";

export class CvHeaderService {
	async create(cvId: string, data: CreateCvHeaderInput) {
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
			throw new ConflictError("CV_HEADER_ALREADY_EXISTS", "This CV already has a header.");
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
				settings: data?.settings ?? {},
				drivingLicenses: data?.drivingLicenses ?? [],
				hasVehicle: data?.hasVehicle ?? false,
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
	async update(cvId: string, data: UpdateCvHeaderInput) {
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
			data: {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
				...(data.phone !== undefined ? { phone: data.phone } : {}),
				...(data.email !== undefined ? { email: data.email } : {}),
				...(data.location !== undefined ? { location: data.location } : {}),
				...(data.portfolio !== undefined ? { portfolio: data.portfolio } : {}),
				...(data.nom !== undefined ? { nom: data.nom } : {}),
				...(data.prenom !== undefined ? { prenom: data.prenom } : {}),
				...(data.settings !== undefined ? { settings: data.settings } : {}),
				...(data.drivingLicenses !== undefined ? { drivingLicenses: data.drivingLicenses } : {}),
				...(data.hasVehicle !== undefined ? { hasVehicle: data.hasVehicle } : {}),
			},
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
