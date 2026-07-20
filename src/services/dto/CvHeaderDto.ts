export interface CreateCvHeaderDto {
	title: string;
	subtitle?: string | null;
	phone?: string | null;
	email?: string | null;
	location?: string | null;
	portfolio?: string | null;
	nom?: string | null;
	prenom?: string | null;
}

export interface UpdateCvHeaderDto {
	title?: string;
	subtitle?: string | null;
	phone?: string | null;
	email?: string | null;
	location?: string | null;
	portfolio?: string | null;
	nom?: string | null;
	prenom?: string | null;
}
