import type { ThemeTokenOverrides } from "./themeTokens";

/**
 * Presets typo **header uniquement**, dérivés de la majorité du catalogue
 * (`docs/cv-templates-catalog.md` → par `sectionHeader`).
 *
 * Branchés dans `themeTokens.ts` via :
 * `defineTokens(mergeTokenOverrides(headerXTokenDefaults, { …deltas }))`.
 *
 * ⚠️ Un spread plat `{ ...preset, headerTitle: { textAlign: "center" } }`
 * **remplace** tout le bloc `headerTitle` — préférer `mergeTokenOverrides`.
 */

/** Rôles typo du bandeau header (hors section / body / meta). */
export type HeaderTokenPreset = Pick<
	ThemeTokenOverrides,
	"headerTitle" | "headerSubTitle" | "headerContent" | "headerNom" | "headerPrenom"
>;

/**
 * Deep-merge de plusieurs override packs (rôles TextStyle fusionnés).
 * Utile pour empiler preset header + deltas template.
 */
export function mergeTokenOverrides(
	...parts: ThemeTokenOverrides[]
): ThemeTokenOverrides {
	const out: ThemeTokenOverrides = {};
	for (const part of parts) {
		for (const key of Object.keys(part) as (keyof ThemeTokenOverrides)[]) {
			const value = part[key];
			if (!value) continue;
			out[key] = { ...out[key], ...value };
		}
	}
	return out;
}

/**
 * HeaderOne — `titleCompo` + sous-titre.
 * Base catalogue : Kyoto (poids lg/sm) ; Florence / Helsinki / Geneva partent d’ici.
 * Variantes vues : Stockholm (center), Geneva (couleurs).
 */
export const headerOneTokenDefaults: HeaderTokenPreset = {
	headerTitle: { weightSelect: "lg" },
	headerSubTitle: { weightSelect: "sm" },
};

/**
 * HeaderTwo — titre + sous-titre, souvent centrés.
 * Base catalogue : Nara / Reykjavik / Krakow (3/4).
 * Variante : Oslo (primary + sous-titre plus gros).
 */
export const headerTwoTokenDefaults: HeaderTokenPreset = {
	headerTitle: { weightSelect: "lg", textAlign: "center", colorSelect: "black" },
	headerSubTitle: {
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "primaryColor",
	},
};

/**
 * HeaderThree — nom / prénom empilés + sous-titre.
 * Base catalogue : Denver / Seoul / Shenzhen / Lisbon.
 */
export const headerThreeTokenDefaults: HeaderTokenPreset = {
	headerNom: {
		sizeModel: "24px",
		weightModel: 700,
		colorSelect: "primaryColor",
		weightSelect: "lg",
	},
	headerPrenom: {
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "black",
		weightSelect: "sm",
		sizeSelect: "lg",
	},
	headerSubTitle: { sizeModel: "18px", weightModel: 500, colorSelect: "gray" },
};

/**
 * HeaderFour — bandeau + nom/prénom en ligne, identité souvent à droite.
 * Base catalogue : Austin / Chicago / … / Zurich (8/8 sur le bloc identité).
 */
export const headerFourTokenDefaults: HeaderTokenPreset = {
	headerNom: {
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: { textAlign: "right" },
};

/**
 * HeaderFive — titre / sous-titre centrés (sidebar) ; seeds portent aussi nom/prénom droite.
 * Base catalogue : Singapore / Toronto / Frankfurt.
 */
export const headerFiveTokenDefaults: HeaderTokenPreset = {
	headerNom: {
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerTitle: { sizeModel: "18px", weightModel: 600, textAlign: "center" },
	headerSubTitle: { sizeModel: "18px", weightModel: 600, textAlign: "center" },
};

/**
 * HeaderSplitOne — sidebar contacts + main nom/prénom / intitulé.
 * Base catalogue : Berlin, Seattle, Hamburg.
 */
export const headerSplitOneTokenDefaults: HeaderTokenPreset = {
	headerNom: {
		textAlign: "left",
		sizeModel: "26px",
		weightModel: 700,
		colorSelect: "black",
	},
	headerPrenom: {
		textAlign: "left",
		sizeModel: "26px",
		weightModel: 400,
		colorSelect: "black",
	},
	headerTitle: {
		sizeModel: "26px",
		weightModel: 700,
		colorSelect: "black",
		textAlign: "left",
	},
	headerSubTitle: {
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		textAlign: "left",
	},
	headerContent: { sizeModel: "12px", textAlign: "left" },
};
