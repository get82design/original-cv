import type { CvTimelineStatus } from "../../../generated/prisma/enums";

export interface CreateCvEducationDto {
	title: string;
	school: string;
	city?: string;
	degree: string;
	start: Date;
	end?: Date;
	obtained?: CvTimelineStatus;
	order: number;
}

export interface UpdateCvEducationDto {
	title?: string;
	school?: string;
	city?: string;
	degree?: string;
	start?: Date;
	end?: Date | null;
	obtained?: CvTimelineStatus | null;
}
