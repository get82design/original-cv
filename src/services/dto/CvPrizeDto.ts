export interface CreateCvPrizeDto {
	title: string;
	domaine: string;
	order?: number;
}

export interface UpdateCvPrizeDto {
	title?: string;
	domaine?: string;
}
