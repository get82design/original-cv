import type { CreateCvSkillDto } from "./CvSkillDto";

export interface CreateCvSkillGroupDto {
	title: string;
	order: number;
	skills: CreateCvSkillDto[];
}

export interface UpdateCvSkillGroupDto {
	title?: string;
	skills?: CreateCvSkillDto[];
}
