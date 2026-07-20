export interface CreateCvStrengthDto {
	title: string;
	icon?: string | null;
	order?: number;
}

export interface UpdateCvStrengthDto {
	title?: string;
	icon?: string | null;
}
