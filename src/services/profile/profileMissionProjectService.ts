import { prisma } from "../../../lib/prisma";
import type {
	CreateCvMissionProjectDto,
	UpdateCvMissionProjectDto,
} from "../dto/CvMissionProjectDto";
import { ConflictError, NotFoundError } from "../errors";

export class ProfileMissionProjectService {
	async create(profileProjectId: string, data: CreateCvMissionProjectDto) {
		const project = await prisma.project.findUnique({
			where: {
				id: profileProjectId,
			},
			select: {
				id: true,
			},
		});

		if (!project) {
			throw new NotFoundError("Profile Project", profileProjectId);
		}

		const existingOrder = await prisma.missionProject.findUnique({
			where: {
				projectId_order: {
					projectId: profileProjectId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_MISSION_PROJECT_ORDER_ALREADY_EXISTS",
				"This order is already used for this project.",
			);
		}

		return prisma.missionProject.create({
			data: {
				projectId: profileProjectId,
				content: data.content,
				order: data.order,
			},
		});
	}

	async findAllByProfileProjectId(profileProjectId: string) {
		return prisma.missionProject.findMany({
			where: {
				projectId: profileProjectId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateCvMissionProjectDto) {
		const existing = await prisma.missionProject.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Mission Project", id);
		}

		return prisma.missionProject.update({
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

		const mission = await prisma.missionProject.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("Profile Mission Project", id);
		}

		if (mission.order === newOrder) {
			return mission;
		}

		return prisma.$transaction(async (tx) => {
			const missions = await tx.missionProject.findMany({
				where: {
					projectId: mission.projectId,
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
				throw new NotFoundError("Profile Mission Project", id);
			}

			missions.splice(newIndex, 0, movedMission);

			for (let index = 0; index < missions.length; index++) {
				await tx.missionProject.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: -(index + 1),
					},
				});
			}

			for (let index = 0; index < missions.length; index++) {
				await tx.missionProject.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: index + 1,
					},
				});
			}

			return tx.missionProject.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const mission = await prisma.missionProject.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("Profile Mission Project", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.missionProject.delete({
				where: {
					id,
				},
			});

			const remaining = await tx.missionProject.findMany({
				where: {
					projectId: mission.projectId,
				},
				orderBy: {
					order: "asc",
				},
			});

			for (let index = 0; index < remaining.length; index++) {
				await tx.missionProject.update({
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

export const profileMissionProjectService = new ProfileMissionProjectService();
