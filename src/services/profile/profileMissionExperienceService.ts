import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateMissionInput,
	UpdateMissionInput,
} from "../schemas/mission.schema";

export class ProfileMissionExperienceService {
	async create(profileId: string, data: CreateMissionInput) {
		const experience = await prisma.experience.findUnique({
			where: {
				id: profileId,
			},
			select: {
				id: true,
			},
		});

		if (!experience) {
			throw new NotFoundError("Profile Experience", profileId);
		}

		const existingOrder = await prisma.missionExperience.findUnique({
			where: {
				experienceId_order: {
					experienceId: profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_MISSION_EXPERIENCE_ORDER_ALREADY_EXISTS",
				"This order is already used for this experience.",
			);
		}

		return prisma.missionExperience.create({
			data: {
				experienceId: profileId,
				content: data.content,
				order: data.order,
			},
		});
	}

	async findAllByExperienceId(experienceId: string) {
		return prisma.missionExperience.findMany({
			where: {
				experienceId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateMissionInput) {
		const existing = await prisma.missionExperience.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Mission Experience", id);
		}

		return prisma.missionExperience.update({
			where: {
				id,
			},
			data: {
				content: data.content ?? existing.content,
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new Error("Invalid order");
		}

		const mission = await prisma.missionExperience.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("Profile Mission Experience", id);
		}

		if (mission.order === newOrder) {
			return mission;
		}

		return prisma.$transaction(async (tx) => {
			const missions = await tx.missionExperience.findMany({
				where: {
					experienceId: mission.experienceId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const oldIndex = missions.findIndex((item) => item.id === id);

			const newIndex = newOrder - 1;

			if (newIndex >= missions.length) {
				throw new Error("Invalid order");
			}

			const [movedMission] = missions.splice(oldIndex, 1);

			if (!movedMission) {
				throw new NotFoundError("Profile Mission Experience", id);
			}

			missions.splice(newIndex, 0, movedMission);

			for (let index = 0; index < missions.length; index++) {
				await tx.missionExperience.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: -(index + 1),
					},
				});
			}

			for (let index = 0; index < missions.length; index++) {
				await tx.missionExperience.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: index + 1,
					},
				});
			}

			return tx.missionExperience.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const mission = await prisma.missionExperience.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("Profile Mission Experience", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.missionExperience.delete({
				where: {
					id,
				},
			});

			const remaining = await tx.missionExperience.findMany({
				where: {
					experienceId: mission.experienceId,
				},
				orderBy: {
					order: "asc",
				},
			});

			for (let index = 0; index < remaining.length; index++) {
				await tx.missionExperience.update({
					where: {
						id: remaining[index]!.id,
					},
					data: {
						order: index + 1,
					},
				});
			}

			return true;
		});
	}
}

export const profileMissionExperienceService =
	new ProfileMissionExperienceService();
