import { TemplateStyleCategory } from "../../generated/prisma/enums";

/** Libellés FR pour UI catalogue / admin. */
export const TEMPLATE_STYLE_LABELS: Record<TemplateStyleCategory, string> = {
	[TemplateStyleCategory.CLASSIC]: "Classique",
	[TemplateStyleCategory.MODERN]: "Moderne",
	[TemplateStyleCategory.CREATIVE]: "Créatif",
	[TemplateStyleCategory.PROFESSIONAL]: "Professionnel",
	[TemplateStyleCategory.BOLD]: "Audacieux",
};

export const TEMPLATE_STYLE_OPTIONS: {
	value: TemplateStyleCategory;
	label: string;
}[] = (
	[
		TemplateStyleCategory.CLASSIC,
		TemplateStyleCategory.MODERN,
		TemplateStyleCategory.CREATIVE,
		TemplateStyleCategory.PROFESSIONAL,
		TemplateStyleCategory.BOLD,
	] as const
).map((value) => ({
	value,
	label: TEMPLATE_STYLE_LABELS[value],
}));

export function templateStyleLabel(category: TemplateStyleCategory): string {
	return TEMPLATE_STYLE_LABELS[category];
}
