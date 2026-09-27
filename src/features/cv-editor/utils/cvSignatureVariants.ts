import type { LogoColorRef } from "@/components/brand/logoTokens";
import { CV_PAGE_PAD_PX, CV_SIGNATURE_RESERVE_PX } from "./cvPage";

/** Habillage de la signature bas de page — export gratuit uniquement. */
export type CvSignatureVariantId = "minimal" | "band" | "corners";

export interface CvSignatureVariant {
	id: CvSignatureVariantId;
	label: string;
	description: string;
}

export const CV_SIGNATURE_VARIANTS: CvSignatureVariant[] = [
	{
		id: "minimal",
		label: "Sobre",
		description: "Mention et logo seuls, sans décor.",
	},
	{
		id: "band",
		label: "Bande",
		description: "Bande claire pleine largeur, texte en noir.",
	},
	{
		id: "corners",
		label: "Angles",
		description: "Deux triangles dans les angles bas de page.",
	},
];

/**
 * Budget vertical de la signature : réserve de pagination + plus petit padding de page.
 * Toute variante doit tenir dedans, sinon elle chevauche le contenu en marge `sm`.
 */
export const CV_SIGNATURE_MAX_FOOTPRINT_PX = CV_SIGNATURE_RESERVE_PX + CV_PAGE_PAD_PX.sm;

export type CvSignatureDecoration = "none" | "band" | "corners";

export interface CvSignatureStyle {
	/** Couleur de la mention « Édité sur … ». */
	textColor: string;
	decoration: CvSignatureDecoration;
	/** Hauteur du décor (0 si aucun). */
	decorationHeight: number;
	/** Teinte claire : fond de bande, triangle de droite. */
	tintLight: string;
	/** Teinte soutenue : triangle de gauche. */
	tintDeep: string;
	/** Décalage bas de page de la ligne mention + logo. */
	rowBottom: number;
	/** Hauteur de la ligne mention + logo (centre le contenu sur la bande). */
	rowHeight: number;
}

/** Noir d'impression du logo — réutilisé pour le texte sur bande claire. */
const PRINT_INK = "#1d1d1b";

const LOGO_HEIGHT_PX = 28;
const BAND_HEIGHT_PX = 44;
/** Triangles plus hauts : le décor démarre plus tôt depuis le bas. */
const CORNERS_HEIGHT_PX = 48;
/** Ligne mention + logo un cran plus bas, dans la zone centrale entre les triangles. */
const CORNERS_ROW_BOTTOM_PX = 12;

const isNeutral = (primary: LogoColorRef | null | undefined) =>
	!primary?.name || primary.name === "black";

/** Nuance fixe (200 / 300) — retombe sur le gris comme `tintPair`. */
const shade = (primary: LogoColorRef | null | undefined, level: 200 | 300) =>
	isNeutral(primary) ? `var(--gray-${level})` : `var(--${primary?.name}-${level})`;

/** Nuance principale du CV : celle choisie dans le layout, 600 par défaut. */
const deepShade = (primary: LogoColorRef | null | undefined) =>
	isNeutral(primary) ? "var(--gray-700)" : `var(--${primary?.name}${primary?.primary || "-600"})`;

export function cvSignatureStyle(
	variant: CvSignatureVariantId,
	primary: LogoColorRef | null | undefined,
): CvSignatureStyle {
	const tintLight = shade(primary, 300);
	const tintDeep = deepShade(primary);

	if (variant === "band") {
		return {
			textColor: PRINT_INK,
			decoration: "band",
			decorationHeight: BAND_HEIGHT_PX,
			tintLight: shade(primary, 200),
			tintDeep,
			rowBottom: 0,
			rowHeight: BAND_HEIGHT_PX,
		};
	}

	if (variant === "corners") {
		return {
			textColor: PRINT_INK,
			decoration: "corners",
			decorationHeight: CORNERS_HEIGHT_PX,
			tintLight,
			tintDeep,
			rowBottom: CORNERS_ROW_BOTTOM_PX,
			rowHeight: LOGO_HEIGHT_PX,
		};
	}

	return {
		textColor: PRINT_INK,
		decoration: "none",
		decorationHeight: 0,
		tintLight,
		tintDeep,
		rowBottom: 12,
		rowHeight: LOGO_HEIGHT_PX,
	};
}
