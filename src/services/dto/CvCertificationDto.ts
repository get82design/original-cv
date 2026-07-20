export interface CreateCvCertificationDto {
	title: string;
	organismeCertification: string;
	order?: number;
}

export interface UpdateCvCertificationDto {
	title?: string;
	organismeCertification?: string;
}
