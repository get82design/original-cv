import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../errors";
import type {
	CreateSkillBaseInput,
	UpdateSkillBaseInput,
} from "../schemas/skillBase.schema";

export class SkillService {
	async create(data: CreateSkillBaseInput) {
		const existingSkill = await prisma.skill.findFirst({
			where: {
				name: data.name.trim(),
			},
		});

		if (existingSkill) {
			return existingSkill;
		}

		return await prisma.skill.create({
			data: {
				name: data.name.trim(),
			},
		});
	}

	async findAll() {
		return await prisma.skill.findMany({
			orderBy: {
				name: "asc",
			},
		});
	}

	async update(id: string, data: UpdateSkillBaseInput) {
		const skill = await prisma.skill.findUnique({
			where: {
				id,
			},
		});

		if (!skill) {
			throw new NotFoundError("Skill not found");
		}

		const existingSkill = await prisma.skill.findFirst({
			where: {
				name: data.name?.trim() ?? "",
			},
		});

		if (existingSkill) {
			throw new ConflictError("Skill already exists");
		}

		return await prisma.skill.update({
			where: {
				id,
			},
			data: {
				name: data.name?.trim() ?? "",
			},
		});
	}

	async delete(id: string) {
		const skill = await prisma.skill.findUnique({
			where: {
				id,
			},
		});

		if (!skill) {
			throw new NotFoundError("Skill not found");
		}

		const usedSkill = await prisma.skill.findFirst({
			where: {
				id,
				OR: [
					{
						cvSkills: {
							some: {},
						},
					},
					{
						profileSkills: {
							some: {},
						},
					},
				],
			},
		});

		if (usedSkill) {
			throw new ConflictError(
				"SKILL_ALREADY_USED",
				"This skill is already used and cannot be deleted.",
			);
		}

		return await prisma.skill.delete({
			where: {
				id,
			},
		});
	}
}

export const skillService = new SkillService();
