export interface CreateCvAchievementDto {
	title: string;
	description?: string;
	year?: number;
	technology?: string;
	order: number;
}

export interface UpdateCvAchievementDto {
	title?: string;
	description?: string;
	year?: number;
	technology?: string;
}
