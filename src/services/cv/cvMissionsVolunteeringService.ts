import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateMissionInput,
	UpdateMissionInput,
} from "../schemas/mission.schema";

export class CvMissionVolunteeringService {
	async create(cvVolunteeringId: string, data: CreateMissionInput) {
		const volunteering = await prisma.cvVolunteering.findUnique({
			where: {
				id: cvVolunteeringId,
			},
			select: {
				id: true,
			},
		});

		if (!volunteering) {
			throw new NotFoundError("CV Volunteering", cvVolunteeringId);
		}

		const existingOrder = await prisma.cvMissionVolunteering.findUnique({
			where: {
				cvVolunteeringId_order: {
					cvVolunteeringId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_MISSION_VOLUNTEERING_ORDER_ALREADY_EXISTS",
				"This order is already used for this volunteering.",
			);
		}

		return prisma.cvMissionVolunteering.create({
			data: {
				cvVolunteeringId,
				content: data.content,
				order: data.order,
			},
		});
	}

	async findAllByCvVolunteeringId(cvVolunteeringId: string) {
		return prisma.cvMissionVolunteering.findMany({
			where: {
				cvVolunteeringId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateMissionInput) {
		const existing = await prisma.cvMissionVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Mission Volunteering", id);
		}

		return prisma.cvMissionVolunteering.update({
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

		const mission = await prisma.cvMissionVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("CV Mission Volunteering", id);
		}

		if (mission.order === newOrder) {
			return mission;
		}

		return prisma.$transaction(async (tx) => {
			const missions = await tx.cvMissionVolunteering.findMany({
				where: {
					cvVolunteeringId: mission.cvVolunteeringId,
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
				throw new NotFoundError("CV Mission Volunteering", id);
			}

			missions.splice(newIndex, 0, movedMission);

			for (let index = 0; index < missions.length; index++) {
				await tx.cvMissionVolunteering.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: -(index + 1),
					},
				});
			}

			for (let index = 0; index < missions.length; index++) {
				await tx.cvMissionVolunteering.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: index + 1,
					},
				});
			}

			return tx.cvMissionVolunteering.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const mission = await prisma.cvMissionVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("CV Mission Volunteering", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvMissionVolunteering.delete({
				where: {
					id,
				},
			});

			const remaining = await tx.cvMissionVolunteering.findMany({
				where: {
					cvVolunteeringId: mission.cvVolunteeringId,
				},
				orderBy: {
					order: "asc",
				},
			});

			for (let index = 0; index < remaining.length; index++) {
				await tx.cvMissionVolunteering.update({
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

export const cvMissionVolunteeringService = new CvMissionVolunteeringService();
