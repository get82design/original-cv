export interface CreateCvPhilosophyDto {
	citation: string;
	author?: string | null;
}

export interface UpdateCvPhilosophyDto {
	citation?: string;
	author?: string | null;
}
