import type { TemplateStyleCategory } from "../../../generated/prisma/enums";
import { templateStyleLabel } from "@/utils/templateStyleCategory";

/**
 * Texte marketing court pour la fiche `/modeles/[slug]`.
 */
export function buildTemplateMarketingCopy(input: {
	name: string;
	columns: number;
	isPremium: boolean;
	isFeatured: boolean;
	styleCategory: TemplateStyleCategory;
}): { title: string; description: string; blurb: string } {
	const cols = input.columns > 1 ? "2 colonnes" : "1 colonne";
	const tier = input.isPremium ? "premium" : "gratuit";
	const style = templateStyleLabel(input.styleCategory).toLowerCase();
	const featured = input.isFeatured ? " Mis en avant dans le catalogue." : "";

	const title = `Modèle de CV ${input.name} — OriginalCV`;
	const description = `CV ${input.name} (${cols}, style ${style}, ${tier}) : créez et personnalisez votre curriculum vitae en ligne avec OriginalCV.`;
	const blurb = `Le modèle ${input.name} est un design ${style} en ${cols}, accès ${tier}.${featured} Adaptez couleurs et mise en page, puis exportez votre CV.`;

	return { title, description, blurb };
}
