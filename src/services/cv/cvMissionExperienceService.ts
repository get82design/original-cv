import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type { CreateMissionInput, UpdateMissionInput } from "../schemas/mission.schema";

export class CvMissionExperienceService {
	async create(cvExperienceId: string, data: CreateMissionInput) {
		const experience = await prisma.cvExperience.findUnique({
			where: {
				id: cvExperienceId,
			},
			select: {
				id: true,
			},
		});

		if (!experience) {
			throw new NotFoundError("CV Experience", cvExperienceId);
		}

		const existingOrder = await prisma.cvMissionExperience.findUnique({
			where: {
				cvExperienceId_order: {
					cvExperienceId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_MISSION_EXPERIENCE_ORDER_ALREADY_EXISTS",
				"This order is already used for this experience.",
			);
		}

		return prisma.cvMissionExperience.create({
			data: {
				cvExperienceId,
				content: data.content,
				order: data.order,
			},
		});
	}

	async findAllByCvExperienceId(cvExperienceId: string) {
		return prisma.cvMissionExperience.findMany({
			where: {
				cvExperienceId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateMissionInput) {
		const existing = await prisma.cvMissionExperience.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Mission Experience", id);
		}

		return prisma.cvMissionExperience.update({
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

		const mission = await prisma.cvMissionExperience.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("CV Mission Experience", id);
		}

		if (mission.order === newOrder) {
			return mission;
		}

		return prisma.$transaction(async (tx) => {
			const missions = await tx.cvMissionExperience.findMany({
				where: {
					cvExperienceId: mission.cvExperienceId,
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
				throw new NotFoundError("CV Mission Experience", id);
			}

			missions.splice(newIndex, 0, movedMission);

			for (let index = 0; index < missions.length; index++) {
				await tx.cvMissionExperience.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: -(index + 1),
					},
				});
			}

			for (let index = 0; index < missions.length; index++) {
				await tx.cvMissionExperience.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: index + 1,
					},
				});
			}

			return tx.cvMissionExperience.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const mission = await prisma.cvMissionExperience.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("CV Mission Experience", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvMissionExperience.delete({
				where: {
					id,
				},
			});

			const remaining = await tx.cvMissionExperience.findMany({
				where: {
					cvExperienceId: mission.cvExperienceId,
				},
				orderBy: {
					order: "asc",
				},
			});

			for (let index = 0; index < remaining.length; index++) {
				await tx.cvMissionExperience.update({
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

export const cvMissionExperienceService = new CvMissionExperienceService();
