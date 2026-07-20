import type { Level } from "../../../generated/prisma/enums";

export interface CreateCvSkillDto {
	level: Level;
	skillId: string;
	order: number;
}

export interface UpdateCvSkillDto {
	level?: Level;
	skillId?: string;
}
