import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import { ConflictError, NotFoundError } from "../errors";
import type { CreateProjectInput, UpdateProjectInput } from "../schemas/project.schema";

export class ProfileProjectService {
	async create(profileId: string, data: CreateProjectInput) {
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

		const existingProject = await prisma.project.findUnique({
			where: {
				profileId_title: {
					profileId,
					title: data.title,
				},
			},
		});

		if (existingProject) {
			throw new ConflictError(
				"PROFILE_PROJECT_ALREADY_EXISTS",
				"This project already exists for this profile.",
			);
		}

		const existingOrder = await prisma.project.findUnique({
			where: {
				profileId_order: {
					profileId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"PROFILE_PROJECT_ORDER_ALREADY_EXISTS",
				"This order is already used for this profile.",
			);
		}

		validateTimeline(data.start, data.end, data.status);

		return prisma.project.create({
			data: {
				profileId,
				title: data.title,
				description: data.description ?? null,
				location: data.location ?? null,
				start: data.start,
				end: data.end ?? null,
				technology: data.technology ?? null,
				status: data.status ?? null,
				order: data.order,
			},
		});
	}

	async findAllByProfileId(profileId: string) {
		return prisma.project.findMany({
			where: {
				profileId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateProjectInput) {
		const existing = await prisma.project.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("Profile Project", id);
		}

		if (data.title) {
			const duplicate = await prisma.project.findFirst({
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
					"PROFILE_PROJECT_ALREADY_EXISTS",
					"This project already exists for this profile.",
				);
			}
		}

		validateTimeline(
			data.start ?? existing.start,
			data.end !== undefined ? data.end : existing.end,
			data.status !== undefined ? data.status : existing.status,
		);

		const dataToUpdate = {
			title: data.title ?? existing.title,
			description: data.description ?? existing.description,
			location: data.location ?? existing.location,
			technology: data.technology ?? existing.technology,
			start: data.start ?? existing.start,
			end: data.end !== undefined ? data.end : existing.end,
			status: data.status !== undefined ? data.status : existing.status,
		};

		return prisma.project.update({
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

		const project = await prisma.project.findUnique({
			where: {
				id,
			},
		});

		if (!project) {
			throw new NotFoundError("Profile Project", id);
		}

		if (project.order === newOrder) {
			return project;
		}

		return prisma.$transaction(async (tx) => {
			const projects = await tx.project.findMany({
				where: {
					profileId: project.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(projects, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.project.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.project.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.project.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const project = await prisma.project.findUnique({
			where: {
				id,
			},
		});

		if (!project) {
			throw new NotFoundError("Profile Project", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.project.delete({
				where: {
					id,
				},
			});

			const projects = await tx.project.findMany({
				where: {
					profileId: project.profileId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(projects);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.project.update({
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
				await tx.project.update({
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

export const profileProjectService = new ProfileProjectService();
