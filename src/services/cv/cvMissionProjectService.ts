import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateMissionInput,
	UpdateMissionInput,
} from "../schemas/mission.schema";

export class CvMissionProjectService {
	async create(cvProjectId: string, data: CreateMissionInput) {
		const project = await prisma.cvProject.findUnique({
			where: {
				id: cvProjectId,
			},
			select: {
				id: true,
			},
		});

		if (!project) {
			throw new NotFoundError("CV Project", cvProjectId);
		}

		const existingOrder = await prisma.cvMissionProject.findUnique({
			where: {
				cvProjectId_order: {
					cvProjectId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_MISSION_PROJECT_ORDER_ALREADY_EXISTS",
				"This order is already used for this project.",
			);
		}

		return prisma.cvMissionProject.create({
			data: {
				cvProjectId,
				content: data.content,
				order: data.order,
			},
		});
	}

	async findAllByCvProjectId(cvProjectId: string) {
		return prisma.cvMissionProject.findMany({
			where: {
				cvProjectId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateMissionInput) {
		const existing = await prisma.cvMissionProject.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Mission Project", id);
		}

		return prisma.cvMissionProject.update({
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

		const mission = await prisma.cvMissionProject.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("CV Mission Project", id);
		}

		if (mission.order === newOrder) {
			return mission;
		}

		return prisma.$transaction(async (tx) => {
			const missions = await tx.cvMissionProject.findMany({
				where: {
					cvProjectId: mission.cvProjectId,
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
				throw new NotFoundError("CV Mission Project", id);
			}

			missions.splice(newIndex, 0, movedMission);

			for (let index = 0; index < missions.length; index++) {
				await tx.cvMissionProject.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: -(index + 1),
					},
				});
			}

			for (let index = 0; index < missions.length; index++) {
				await tx.cvMissionProject.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: index + 1,
					},
				});
			}

			return tx.cvMissionProject.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const mission = await prisma.cvMissionProject.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("CV Mission Project", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvMissionProject.delete({
				where: {
					id,
				},
			});

			const remaining = await tx.cvMissionProject.findMany({
				where: {
					cvProjectId: mission.cvProjectId,
				},
				orderBy: {
					order: "asc",
				},
			});

			for (let index = 0; index < remaining.length; index++) {
				await tx.cvMissionProject.update({
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

export const cvMissionProjectService = new CvMissionProjectService();
