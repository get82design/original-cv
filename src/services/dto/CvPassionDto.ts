export interface CreateCvPassionDto {
	title: string;
	icon: string;
	order?: number;
}

export interface UpdateCvPassionDto {
	title?: string;
	icon?: string;
}
