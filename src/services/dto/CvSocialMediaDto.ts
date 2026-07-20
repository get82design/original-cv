export interface CreateCvSocialMediaDto {
	socialNetwork: string;
	username: string;
	order?: number;
}

export interface UpdateCvSocialMediaDto {
	socialNetwork?: string;
	username?: string;
}

export interface MoveCvSocialMediaDto {
	order: number;
}
