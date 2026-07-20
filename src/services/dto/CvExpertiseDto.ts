import type { Level } from "../../../generated/prisma/enums";

export interface CreateCvExpertiseDto {
	title: string;
	level: Level;
	order?: number;
}

export interface UpdateCvExpertiseDto {
	title?: string;
	level?: Level;
}
