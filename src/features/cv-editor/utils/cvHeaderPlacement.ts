import type { HeaderPlacement } from "@/services/schemas/cvTemplate.schema";

/** IDs de mesure des blocs header (hors sections) pour la pagination A4. */
export const HEADER_TOP_ID = "__cv_header_top__";
export const HEADER_SIDEBAR_ID = "__cv_header_sidebar__";
export const HEADER_SPLIT_SIDEBAR_ID = "__cv_header_split_sidebar__";
export const HEADER_SPLIT_MAIN_ID = "__cv_header_split_main__";

/**
 * Estimations tant que le bloc n’est pas mesuré : sans elles le budget page 1
 * est trop large et le contenu déborde au lieu de passer page 2.
 */
export const HEADER_FALLBACK_PX = {
	top: 240,
	splitSidebar: 220,
	splitMain: 140,
} as const;

export type TwoColumnHeaderHeights = {
	/** Header hors flux des colonnes (placement "top") : réduit la hauteur utile. */
	top: number;
	/** Header en tête de colonne sidebar, page 1. */
	sidebar: number;
	/** Header en tête de colonne principale, page 1. */
	main: number;
};

/** IDs à observer selon le placement — un seul bloc header est rendu à la fois. */
export function headerMeasureIds(placement: HeaderPlacement): string[] {
	if (placement === "top") return [HEADER_TOP_ID];
	if (placement === "sidebar") return [HEADER_SIDEBAR_ID];
	return [HEADER_SPLIT_SIDEBAR_ID, HEADER_SPLIT_MAIN_ID];
}

function measuredOrFallback(measured: number | undefined, fallback: number): number {
	const h = measured ?? 0;
	return h > 0 ? h : fallback;
}

/** Hauteurs header à réserver pour `packSectionsIntoPages` selon le placement. */
export function resolveTwoColumnHeaderHeights(
	placement: HeaderPlacement,
	heights: ReadonlyMap<string, number>,
): TwoColumnHeaderHeights {
	if (placement === "top") {
		return {
			top: measuredOrFallback(heights.get(HEADER_TOP_ID), HEADER_FALLBACK_PX.top),
			sidebar: 0,
			main: 0,
		};
	}

	if (placement === "sidebar") {
		return { top: 0, sidebar: heights.get(HEADER_SIDEBAR_ID) ?? 0, main: 0 };
	}

	return {
		top: 0,
		sidebar: measuredOrFallback(
			heights.get(HEADER_SPLIT_SIDEBAR_ID),
			HEADER_FALLBACK_PX.splitSidebar,
		),
		main: measuredOrFallback(heights.get(HEADER_SPLIT_MAIN_ID), HEADER_FALLBACK_PX.splitMain),
	};
}
