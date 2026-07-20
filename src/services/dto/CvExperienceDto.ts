export interface CreateCvExperienceDto {
	title: string;
	company: string;
	description?: string;
	start: Date;
	end?: Date;
	location?: string;
	missions: CreateCvMissionExperienceDto[];
	order: number;
}

export interface UpdateCvExperienceDto {
	title?: string;
	company?: string;
	description?: string;
	start?: Date;
	end?: Date;
	location?: string;
	missions?: CreateCvMissionExperienceDto[];
}

export interface CreateCvMissionExperienceDto {
	content: string;
	order: number;
}
