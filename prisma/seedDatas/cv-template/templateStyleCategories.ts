import { TemplateStyleCategory } from "../../../generated/prisma/enums";

/**
 * Style marketing par nom de template seed.
 * Tout nouveau template doit être ajouté ici (sinon le seed throw).
 */
export const TEMPLATE_STYLE_BY_NAME: Record<string, TemplateStyleCategory> = {
	// Classique
	Stockholm: TemplateStyleCategory.CLASSIC,
	Kyoto: TemplateStyleCategory.CLASSIC,
	Oslo: TemplateStyleCategory.CLASSIC,
	Geneva: TemplateStyleCategory.CLASSIC,
	Helsinki: TemplateStyleCategory.CLASSIC,
	Nara: TemplateStyleCategory.CLASSIC,
	Reykjavik: TemplateStyleCategory.CLASSIC,
	Eindhoven: TemplateStyleCategory.CLASSIC,
	Oxford: TemplateStyleCategory.CLASSIC,
	Prague: TemplateStyleCategory.CLASSIC,
	// Moderne
	Austin: TemplateStyleCategory.MODERN,
	Portland: TemplateStyleCategory.MODERN,
	Tallinn: TemplateStyleCategory.MODERN,
	Zurich: TemplateStyleCategory.MODERN,
	Chicago: TemplateStyleCategory.MODERN,
	Tokyo: TemplateStyleCategory.MODERN,
	Madrid: TemplateStyleCategory.MODERN,
	Barcelona: TemplateStyleCategory.MODERN,
	// Créatif
	Denver: TemplateStyleCategory.CREATIVE,
	Seoul: TemplateStyleCategory.CREATIVE,
	Shenzhen: TemplateStyleCategory.CREATIVE,
	Budapest: TemplateStyleCategory.CREATIVE,
	Lisbon: TemplateStyleCategory.CREATIVE,
	Florence: TemplateStyleCategory.CREATIVE,
	// Professionnel
	Singapore: TemplateStyleCategory.PROFESSIONAL,
	Toronto: TemplateStyleCategory.PROFESSIONAL,
	Frankfurt: TemplateStyleCategory.PROFESSIONAL,
	Krakow: TemplateStyleCategory.PROFESSIONAL,
	// Audacieux
	Berlin: TemplateStyleCategory.BOLD,
	Hamburg: TemplateStyleCategory.BOLD,
	Seattle: TemplateStyleCategory.BOLD,
	Munich: TemplateStyleCategory.BOLD,
	Milan: TemplateStyleCategory.BOLD,
	Genoa: TemplateStyleCategory.BOLD,
	Naples: TemplateStyleCategory.BOLD,
	Lyon: TemplateStyleCategory.BOLD,
	Bordeaux: TemplateStyleCategory.BOLD,
	Vienna: TemplateStyleCategory.BOLD,
};

export function styleCategoryForTemplateName(name: string): TemplateStyleCategory {
	const category = TEMPLATE_STYLE_BY_NAME[name];
	if (!category) {
		throw new Error(
			`styleCategory manquant pour le template "${name}" — ajouter une entrée dans templateStyleCategories.ts`,
		);
	}
	return category;
}
