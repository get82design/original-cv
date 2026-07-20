import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import type {
	CreateCvEducationDto,
	UpdateCvEducationDto,
} from "../dto/CvEducationDto";
import { ConflictError, NotFoundError } from "../errors";

export class ProfileEducationService {
	async create(profileId: string, data: CreateCvEducationDto) {
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

		const existingEducation = await prisma.education.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title ?? "",
				},
			},
		});

		if (existingEducation) {
			throw new ConflictError(
				"PROFILE_EDUCATION_ALREADY_EXISTS",
				"This education already exists for this profile.",
			);
		}

		const existingOrder = await prisma.education.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_EDUCATION_ORDER_ALREADY_EXISTS",
				"This order is already used for this profile.",
			);
		}

		validateTimeline(data.start, data.end, data.obtained);

		return prisma.education.create({
			data: {
				profileId,
				title: data.title,
				start: data.start,
				end: data.end ?? null,
				obtained: data.obtained ?? null,
				order: data.order,
				school: data.school,
				city: data.city ?? null,
				degree: data.degree,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.education.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvEducationDto) {
		const existing = await prisma.education.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Education", id);
		}

		if (data.title) {
			const duplicate = await prisma.education.findFirst({
				where: {
					profileId: existing.profileId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"PROFILE_EDUCATION_ALREADY_EXISTS",
					"This education already exists for this profile.",
				);
			}
		}

		validateTimeline(
			data.start ?? existing.start,
			data.end !== undefined ? data.end : existing.end,
			data.obtained !== undefined ? data.obtained : existing.obtained,
		);

		const dataToUpdate = {
			title: data.title ?? existing.title,
			start: data.start ?? existing.start,
			end: data.end !== undefined ? data.end : existing.end,
			obtained: data.obtained !== undefined ? data.obtained : existing.obtained,
			degree: data.degree ?? existing.degree,
			school: data.school ?? existing.school,
			city: data.city ?? existing.city,
		};

		return prisma.education.update({
			where: {
				id,
			},
			data: dataToUpdate,
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const education = await prisma.education.findUnique({
			where: {
				id,
			},
		});

		if (!education) {
			throw new NotFoundError("Profile Education", id);
		}

		if (education.order === newOrder) {
			return education;
		}

		return prisma.$transaction(async (tx) => {
			const educations = await tx.education.findMany({
				where: {
					profileId: education.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(educations, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.education.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.education.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.education.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const education = await prisma.education.findUnique({
			where: {
				id,
			},
		});

		if (!education) {
			throw new NotFoundError("Profile Education", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.education.delete({
				where: {
					id,
				},
			});

			const educations = await tx.education.findMany({
				where: {
					profileId: education.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(educations);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.education.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			// nouveaux ordres
			for (const { item, order } of reordered) {
				await tx.education.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}
		});
	}
}

export const profileEducationService = new ProfileEducationService();
