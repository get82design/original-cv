import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import { validateTimeline } from "../../utils/validateTimeline";
import { ConflictError, NotFoundError } from "../errors";
import type { CreateProjectInput, UpdateProjectInput } from "../schemas/project.schema";

export class CvProjectService {
	async create(cvId: string, data: CreateProjectInput) {
		const cv = await prisma.cV.findUnique({
			where: {
				id: cvId,
			},
			select: {
				id: true,
			},
		});

		if (!cv) {
			throw new NotFoundError("CV", cvId);
		}

		const existingProject = await prisma.cvProject.findUnique({
			where: {
				cvId_title: {
					cvId,
					title: data.title,
				},
			},
		});

		if (existingProject) {
			throw new ConflictError(
				"CV_PROJECT_ALREADY_EXISTS",
				"This project already exists for this CV.",
			);
		}

		const existingOrder = await prisma.cvProject.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
		});

		if (existingOrder) {
			throw new ConflictError(
				"CV_PROJECT_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		validateTimeline(data.start, data.end, data.status);

		return prisma.cvProject.create({
			data: {
				cvId,
				title: data.title,
				description: data.description ?? null,
				location: data.location ?? null,
				start: data.start,
				end: data.end ?? null,
				technology: data.technology ?? null,
				status: data.status ?? null,
				order: data.order,
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return prisma.cvProject.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
		});
	}

	async update(id: string, data: UpdateProjectInput) {
		const existing = await prisma.cvProject.findUnique({
			where: {
				id,
			},
		});

		if (!existing) {
			throw new NotFoundError("CV Project", id);
		}

		if (data.title) {
			const duplicate = await prisma.cvProject.findFirst({
				where: {
					cvId: existing.cvId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_PROJECT_ALREADY_EXISTS",
					"This project already exists for this CV.",
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
			settings: data.settings ?? {},
		};

		return prisma.cvProject.update({
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

		const project = await prisma.cvProject.findUnique({
			where: {
				id,
			},
		});

		if (!project) {
			throw new NotFoundError("CV Project", id);
		}

		if (project.order === newOrder) {
			return project;
		}

		return prisma.$transaction(async (tx) => {
			const projects = await tx.cvProject.findMany({
				where: {
					cvId: project.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(projects, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cvProject.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cvProject.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cvProject.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const project = await prisma.cvProject.findUnique({
			where: {
				id,
			},
		});

		if (!project) {
			throw new NotFoundError("CV Project", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cvProject.delete({
				where: {
					id,
				},
			});

			const projects = await tx.cvProject.findMany({
				where: {
					cvId: project.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(projects);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cvProject.update({
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
				await tx.cvProject.update({
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

export const cvProjectService = new CvProjectService();
