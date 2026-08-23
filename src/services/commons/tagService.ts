import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateTagSourceInput,
	UpdateTagSourceInput,
} from "../schemas/tagSource.schema";

export class TagService {
	async create(data: CreateTagSourceInput) {
		const existingTag = await prisma.tag.findFirst({
			where: {
				name: data.name.trim().toLowerCase(),
			},
		});

		if (existingTag) {
			return existingTag;
		}

		return await prisma.tag.create({
			data: {
				name: data.name.trim().toLowerCase(),
			},
		});
	}

	async findAll() {
		return await prisma.tag.findMany({
			orderBy: {
				name: "asc",
			},
		});
	}

	async update(id: string, data: UpdateTagSourceInput) {
		const tag = await prisma.tag.findUnique({
			where: {
				id,
			},
		});

		if (!tag) {
			throw new NotFoundError("Tag not found");
		}

		const existingTag = await prisma.tag.findFirst({
			where: {
				name: data.name?.trim().toLowerCase() ?? "",
			},
		});

		if (existingTag) {
			throw new ConflictError("Tag already exists");
		}

		return await prisma.tag.update({
			where: {
				id,
			},
			data: {
				name: data.name?.trim().toLowerCase() ?? "",
			},
		});
	}

	async delete(id: string) {
		const tag = await prisma.tag.findUnique({
			where: {
				id,
			},
		});

		if (!tag) {
			throw new NotFoundError("Tag not found");
		}

		const usedTag = await prisma.tag.findFirst({
			where: {
				id,
				OR: [
					{
						cvTags: {
							some: {},
						},
					},
					{
						profileTags: {
							some: {},
						},
					},
				],
			},
		});

		if (usedTag) {
			throw new ConflictError(
				"TAG_ALREADY_USED",
				"This tag is already used and cannot be deleted.",
			);
		}

		return await prisma.tag.delete({
			where: {
				id,
			},
		});
	}
}

export const tagService = new TagService();
