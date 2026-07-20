export interface CreateCvTemplateDto {
	name: string;
	structure: {
		sections: string[];
	};
	defaultStyles: {
		color: string;
	};
}
