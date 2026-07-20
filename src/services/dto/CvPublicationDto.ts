export interface CreateCvPublicationDto {
	title: string;
	description?: string;
	journalName?: string;
	start: Date;
	end?: Date;
	url?: string;
	order: number;
}

export interface UpdateCvPublicationDto {
	title?: string;
	description?: string;
	journalName?: string;
	start?: Date;
	end?: Date;
	url?: string;
}
