import type { CVModuleItemType } from "../../../generated/prisma/enums";

export interface CreateCvModuleItemDto {
	itemType: CVModuleItemType;
	itemId: string;
	order: number;
}
