export interface CreateCvDto {
	userId: string;
	templateId: string;
	title: string;
}

export interface UpdateCvDto {
	templateId?: string;
	title?: string;
}
