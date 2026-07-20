import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import type {
	CreateCvCompetenceGroupDto,
	UpdateCvCompetenceGroupDto,
} from "../dto/CvCompetenceGroupDto";
import { ConflictError, NotFoundError, ValidationError } from "../errors";

export class ProfileCompetenceGroupService {
	async create(profileId: string, data: CreateCvCompetenceGroupDto) {
		const existingProfile = await prisma.profile.findUnique({
			where: {
				id: profileId,
			},
			select: {
				id: true,
			},
		});

		if (!existingProfile) {
			throw new NotFoundError("Profile", profileId);
		}

		if (data.title) {
			const existingGroup = await prisma.profileCompetenceGroup.findFirst({
				where: {
					profileId: profileId,
					title: data.title,
				},
			});

			if (existingGroup) {
				throw new ConflictError("Profile Competence Group already exists");
			}
		}

		const existingOrder = await prisma.profileCompetenceGroup.findUnique({
			where: {
				profileId_order: {
					profileId: profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_COMPETENCE_GROUP_ORDER_ALREADY_EXISTS",
				"This order is already used for this Profile.",
			);
		}

		return await prisma.profileCompetenceGroup.create({
			data: {
				title: data.title,
				order: data.order,
				profileId: profileId,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return await prisma.profileCompetenceGroup.findMany({
			where: {
				profileId: profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvCompetenceGroupDto) {
		const existing = await prisma.profileCompetenceGroup.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Competence Group", id);
		}

		if (data.title) {
			const duplicate = await prisma.profileCompetenceGroup.findFirst({
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
					"PROFILE_COMPETENCE_GROUP_ALREADY_EXISTS",
					"This competence group already exists for this Profile.",
				);
			}
		}

		return await prisma.profileCompetenceGroup.update({
			where: {
				id: id,
			},
			data: {
				title: data.title ?? existing.title,
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new ValidationError("Invalid order");
		}

		const competenceGroup = await prisma.profileCompetenceGroup.findUnique({
			where: {
				id,
			},
		});

		if (!competenceGroup) {
			throw new NotFoundError("Profile Competence Group", id);
		}

		if (competenceGroup.order === newOrder) {
			return competenceGroup;
		}

		return prisma.$transaction(async (tx) => {
			const competenceGroups = await tx.profileCompetenceGroup.findMany({
				where: {
					profileId: competenceGroup.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(competenceGroups, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.profileCompetenceGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.profileCompetenceGroup.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.profileCompetenceGroup.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const competenceGroup = await prisma.profileCompetenceGroup.findUnique({
			where: {
				id,
			},
		});

		if (!competenceGroup) {
			throw new NotFoundError("Profile Competence Group", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.profileCompetenceGroup.delete({
				where: {
					id,
				},
			});

			const competenceGroups = await tx.profileCompetenceGroup.findMany({
				where: {
					profileId: competenceGroup.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(competenceGroups);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.profileCompetenceGroup.update({
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
				await tx.profileCompetenceGroup.update({
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

export const profileCompetenceGroupService =
	new ProfileCompetenceGroupService();
