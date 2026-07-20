import { prisma } from "../../../lib/prisma";
import { compactOrder } from "../../utils/compactOrder";
import { reorderItems } from "../../utils/reorderCvItems";
import type { CreateCvModuleDto, UpdateCvModuleDto } from "../dto/CvModuleDto";
import { ValidationError } from "../errors";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";

export class CvModuleService {
	async create(cvId: string, data: CreateCvModuleDto) {
		const existingCv = await prisma.cV.findUnique({
			where: {
				id: cvId,
			},
			select: {
				id: true,
			},
		});

		if (!existingCv) {
			throw new NotFoundError("CV", cvId);
		}

		const orderModule = await prisma.cVModule.findUnique({
			where: {
				cvId_order: {
					cvId,
					order: data.order,
				},
			},
			select: {
				id: true,
			},
		});

		if (orderModule) {
			throw new ConflictError(
				"CV_MODULE_ORDER_ALREADY_EXISTS",
				"This order is already used for this CV.",
			);
		}

		return prisma.cVModule.create({
			data: {
				cvId,
				type: data.type,
				order: data.order,
				title: data.title ?? "",
				settings: data.settings ?? {},
			},
		});
	}

	async findAllByCvId(cvId: string) {
		return await prisma.cVModule.findMany({
			where: {
				cvId,
			},
			orderBy: {
				order: "asc",
			},
			include: {
				items: true,
			},
		});
	}

	async update(id: string, data: UpdateCvModuleDto) {
		const existingModule = await prisma.cVModule.findUnique({
			where: {
				id,
			},
		});

		if (!existingModule) {
			throw new NotFoundError("CV Module", id);
		}

		if (data.title) {
			const duplicate = await prisma.cVModule.findFirst({
				where: {
					cvId: existingModule.cvId,
					title: data.title,
					id: {
						not: id,
					},
				},
			});

			if (duplicate) {
				throw new ConflictError(
					"CV_MODULE_ORDER_ALREADY_EXISTS",
					"This order is already used for this CV.",
				);
			}
		}

		return prisma.cVModule.update({
			where: { id },
			data: {
				title: data.title ?? existingModule.title,
				settings: data.settings ?? existingModule.settings,
				type: data.type ?? existingModule.type,
			},
		});
	}

	async move(id: string, newOrder: number) {
		if (newOrder < 1) {
			throw new ValidationError("Invalid order");
		}

		const module = await prisma.cVModule.findUnique({
			where: {
				id,
			},
		});

		if (!module) {
			throw new NotFoundError("CV Module", id);
		}

		if (module.order === newOrder) {
			return module;
		}

		return prisma.$transaction(async (tx) => {
			const modules = await tx.cVModule.findMany({
				where: {
					cvId: module.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = reorderItems(modules, id, newOrder);

			for (const { item, order } of reordered) {
				await tx.cVModule.update({
					where: {
						id: item.id,
					},
					data: {
						order: -order,
					},
				});
			}

			for (const { item, order } of reordered) {
				await tx.cVModule.update({
					where: {
						id: item.id,
					},
					data: {
						order,
					},
				});
			}

			return tx.cVModule.findUnique({
				where: {
					id,
				},
			});
		});
	}

	async delete(id: string) {
		const module = await prisma.cVModule.findUnique({
			where: {
				id,
			},
		});

		if (!module) {
			throw new NotFoundError("CV Module", id);
		}

		return prisma.$transaction(async (tx) => {
			await tx.cVModule.delete({
				where: {
					id,
				},
			});

			const modules = await tx.cVModule.findMany({
				where: {
					cvId: module.cvId,
				},
				orderBy: {
					order: "asc",
				},
			});

			const reordered = compactOrder(modules);

			// libération contrainte unique
			for (const { item, order } of reordered) {
				await tx.cVModule.update({
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
				await tx.cVModule.update({
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

export const cvModuleService = new CvModuleService();
