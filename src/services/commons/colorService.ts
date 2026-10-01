import { prisma } from "../../../lib/prisma";
import type { CreateColorInput, MoveColorInput, UpdateColorInput } from "../schemas/color.schema";
import { ConflictError, NotFoundError, ValidationError } from "../errors";

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

	/**
	 * Échange l’ordre avec le voisin (haut / bas).
	 * Contourne @@unique([order]) via un order temporaire en transaction.
	 */
	async move(input: MoveColorInput) {
		const colors = await this.findAll();
		const index = colors.findIndex((c) => c.id === input.id);
		if (index < 0) {
			throw new NotFoundError("COLOR", input.id);
		}

		const neighborIndex = input.direction === "up" ? index - 1 : index + 1;
		if (neighborIndex < 0 || neighborIndex >= colors.length) {
			throw new ValidationError(
				"COLOR_MOVE_EDGE",
				input.direction === "up"
					? "La couleur est déjà en première position."
					: "La couleur est déjà en dernière position.",
			);
		}

		const current = colors[index];
		const neighbor = colors[neighborIndex];
		if (!current || !neighbor) {
			throw new ValidationError("COLOR_MOVE_INVALID", "Réordonnancement impossible.");
		}

		const currentOrder = current.order;
		const neighborOrder = neighbor.order;
		const tempOrder = -1_000_000 - currentOrder;

		await prisma.$transaction([
			prisma.color.update({
				where: { id: current.id },
				data: { order: tempOrder },
			}),
			prisma.color.update({
				where: { id: neighbor.id },
				data: { order: currentOrder },
			}),
			prisma.color.update({
				where: { id: current.id },
				data: { order: neighborOrder },
			}),
		]);

		return this.findAll();
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
