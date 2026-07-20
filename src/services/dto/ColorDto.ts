export interface CreateColorDto {
	name: string;
	primary: string;
}

export interface UpdateColorDto {
	name?: string;
	primary?: string;
}
