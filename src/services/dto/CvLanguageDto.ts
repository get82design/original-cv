import type { Level } from "../../../generated/prisma/enums";

export interface CreateCvLanguageDto {
	name: string;
	level: Level;
	order?: number;
}

export interface UpdateCvLanguageDto {
	name?: string;
	level?: Level;
}
