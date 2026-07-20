import type { CvTimelineStatus } from "../../../generated/prisma/enums";

export interface CreateCvFormationDto {
	title: string;
	organismeFormation?: string;
	start: Date;
	end?: Date;
	status?: CvTimelineStatus;
	order: number;
}

export interface UpdateCvFormationDto {
	title?: string;
	organismeFormation?: string;
	start?: Date;
	end?: Date | null;
	status?: CvTimelineStatus | null;
}
