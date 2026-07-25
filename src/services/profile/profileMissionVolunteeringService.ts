import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateMissionInput,
	UpdateMissionInput,
} from "../schemas/mission.schema";

export class ProfileMissionVolunteeringService {
	async create(profileVolunteeringId: string, data: CreateMissionInput) {
		const volunteering = await prisma.volunteering.findUnique({
			where: {
				id: profileVolunteeringId,
			},
			select: {
				id: true,
			},
		});

		if (!volunteering) {
			throw new NotFoundError("Profile Volunteering", profileVolunteeringId);
		}

		const existingOrder = await prisma.missionVolunteering.findUnique({
			where: {
				volunteeringId_order: {
					volunteeringId: profileVolunteeringId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_MISSION_VOLUNTEERING_ORDER_ALREADY_EXISTS",
				"This order is already used for this volunteering.",
			);
		}

		return prisma.missionVolunteering.create({
			data: {
				volunteeringId: profileVolunteeringId,
				content: data.content,
				order: data.order,
			},
		});
	}

	async findAllByProfileVolunteeringId(profileVolunteeringId: string) {
		return prisma.missionVolunteering.findMany({
			where: {
				volunteeringId: profileVolunteeringId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateMissionInput) {
		const existing = await prisma.missionVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Mission Volunteering", id);
		}

		return prisma.missionVolunteering.update({
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

		const mission = await prisma.missionVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("Profile Mission Volunteering", id);
		}

		if (mission.order === newOrder) {
			return mission;
		}

		return prisma.$transaction(async (tx) => {
			const missions = await tx.missionVolunteering.findMany({
				where: {
					volunteeringId: mission.volunteeringId,
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
				throw new NotFoundError("Profile Mission Volunteering", id);
			}

			missions.splice(newIndex, 0, movedMission);

			for (let index = 0; index < missions.length; index++) {
				await tx.missionVolunteering.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: -(index + 1),
					},
				});
			}

			for (let index = 0; index < missions.length; index++) {
				await tx.missionVolunteering.update({
					where: {
						id: missions[index]!.id,
					},
					data: {
						order: index + 1,
					},
				});
			}

			return tx.missionVolunteering.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const mission = await prisma.missionVolunteering.findUnique({
			where: {
				id,
			},
		});

		if (!mission) {
			throw new NotFoundError("Profile Mission Volunteering", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.missionVolunteering.delete({
				where: {
					id,
				},
			});

			const remaining = await tx.missionVolunteering.findMany({
				where: {
					volunteeringId: mission.volunteeringId,
				},
				orderBy: {
					order: "asc",
				},
			});

			for (let index = 0; index < remaining.length; index++) {
				await tx.missionVolunteering.update({
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

export const profileMissionVolunteeringService =
	new ProfileMissionVolunteeringService();
