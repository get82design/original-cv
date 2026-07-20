import type { CVModuleType } from "../../../generated/prisma/enums";

export interface CreateCvModuleDto {
	title?: string;
	type: CVModuleType;
	order: number;
	settings: Record<string, any>;
}

export interface UpdateCvModuleDto {
	title?: string;
	settings: Record<string, any>;
	type?: CVModuleType;
}
