import type { CvTimelineStatus } from "../../../generated/prisma/enums";

export interface CreateCvProjectDto {
	title: string;
	description?: string;
	location?: string;
	start: Date;
	end?: Date;
	technology?: string;
	order: number;
	missions?: CreateCvMissionProjectDto[];
	status?: CvTimelineStatus;
}

export interface UpdateCvProjectDto {
	title?: string;
	description?: string;
	location?: string;
	start?: Date;
	end?: Date;
	technology?: string;
	status?: CvTimelineStatus | null;
	missions?: CreateCvMissionProjectDto[];
}

export interface CreateCvMissionProjectDto {
	content: string;
	order: number;
}
