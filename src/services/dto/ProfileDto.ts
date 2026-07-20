export interface CreateProfileDto {
	firstName: string;
	lastName: string;
	phone?: string;
	location?: string;
}

export interface UpdateProfileDto {
	firstName?: string;
	lastName?: string;
	phone?: string;
	location?: string;
}
