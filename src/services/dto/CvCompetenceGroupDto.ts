import type { CreateCvCompetenceDto } from "./CvCompetenceDto";

export interface CreateCvCompetenceGroupDto {
	title: string;
	order: number;
	competences: CreateCvCompetenceDto[];
}

export interface UpdateCvCompetenceGroupDto {
	title?: string;
	competences?: CreateCvCompetenceDto[];
}
