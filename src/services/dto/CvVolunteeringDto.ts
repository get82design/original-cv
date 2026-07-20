export interface CreateCvVolunteeringDto {
	title: string;
	organisation: string;
	description?: string;
	start: Date;
	end?: Date;
	location?: string;
	missions: CreateCvMissionVolunteeringDto[];
	order: number;
}

export interface UpdateCvVolunteeringDto {
	title?: string;
	organisation?: string;
	description?: string;
	start?: Date;
	end?: Date;
	location?: string;
	missions?: CreateCvMissionVolunteeringDto[];
}

export interface CreateCvMissionVolunteeringDto {
	content: string;
	order: number;
}
