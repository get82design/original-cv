import { prisma } from "../../../lib/prisma";
import type { CreateColorInput, UpdateColorInput } from "../schemas/color.schema";
import { ConflictError, NotFoundError } from "../errors";

export class ColorService {
	async create(data: CreateColorInput) {
		const existing = await prisma.color.findUnique({
			where: {
				name: data.name.trim().toLowerCase(),
			},
		});

		if (existing) {
			throw new ConflictError("COLOR_ALREADY_EXISTS", "La couleur existe déjà");
		}

		const maxOrder = await prisma.color.aggregate({
			_max: { order: true },
		});
		const nextOrder = (maxOrder._max.order ?? -1) + 1;

		return prisma.color.create({
			data: {
				name: data.name.trim().toLowerCase(),
				primary: data.primary,
				order: nextOrder,
			},
		});
	}

	async findAll() {
		return prisma.color.findMany({
			orderBy: {
				order: "asc",
			},
		});
	}

	async findById(id: string) {
		const color = await prisma.color.findUnique({
			where: {
				id,
			},
		});

		if (!color) {
			throw new NotFoundError("COLOR", id);
		}

		return color;
	}

	async findByName(name: string) {
		return prisma.color.findUnique({
			where: {
				name,
			},
		});
	}

	async update(id: string, data: UpdateColorInput) {
		const color = await prisma.color.findUnique({
			where: {
				id,
			},
		});

		if (!color) {
			throw new NotFoundError("COLOR", id);
		}

		if (data.name && data.name !== color.name) {
			const existing = await prisma.color.findUnique({
				where: {
					name: data.name.trim().toLowerCase(),
				},
			});

			if (existing) {
				throw new ConflictError("COLOR_ALREADY_EXISTS", "La couleur existe déjà");
			}
		}

		return prisma.color.update({
			where: {
				id,
			},
			data: {
				name: data.name?.trim().toLowerCase() ?? color.name,
				primary: data.primary ?? color.primary,
			},
		});
	}

	async delete(id: string) {
		const color = await prisma.color.findUnique({
			where: {
				id,
			},
		});

		if (!color) {
			throw new NotFoundError("COLOR", id);
		}

		return prisma.color.delete({
			where: {
				id,
			},
		});
	}
}

export const colorService = new ColorService();
