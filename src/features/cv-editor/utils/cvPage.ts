/** Dimensions visuelles A4 de l’éditeur CV (px). */
export const CV_PAGE_WIDTH = 940;
export const CV_PAGE_HEIGHT = 1300;

/** Padding Tailwind p-8 / p-12 / p-16 → px (1rem = 16). */
export const CV_PAGE_PAD_PX = { sm: 32, md: 48, lg: 64 } as const;

/** Réserve bas de page pour CvSignature (bottom-3 + logo h-7 + marge). */
export const CV_SIGNATURE_RESERVE_PX = 48;

export type CvMarge = keyof typeof CV_PAGE_PAD_PX;

export function cvPageContentHeight(marge: CvMarge = "md"): number {
	const pad = CV_PAGE_PAD_PX[marge] ?? CV_PAGE_PAD_PX.md;
	return CV_PAGE_HEIGHT - 2 * pad - CV_SIGNATURE_RESERVE_PX;
}

export type PackSectionsInput = {
	/** IDs de sections dans l’ordre d’affichage. */
	sectionIds: string[];
	/** Hauteurs mesurées (px). Absentes → 0. */
	heights: ReadonlyMap<string, number>;
	/** Hauteur du header (page 1 uniquement). */
	headerHeight: number;
	/** Hauteur utile de contenu par page (hors padding / signature). */
	contentHeight: number;
};

/**
 * Répartit les sections sur N pages.
 * Page 1 : header + sections tant que ça tient.
 * Pages 2+ : sections suivantes (sans header).
 * Une section plus haute qu’une page part seule (léger overflow V1).
 */
export function packSectionsIntoPages(input: PackSectionsInput): string[][] {
	const { sectionIds, heights, headerHeight, contentHeight } = input;
	if (sectionIds.length === 0) return [[]];

	const pages: string[][] = [[]];
	let used = Math.max(0, headerHeight);
	const limit = Math.max(1, contentHeight);

	for (const id of sectionIds) {
		const h = Math.max(0, heights.get(id) ?? 0);
		const page = pages[pages.length - 1];
		if (!page) break;
		const wouldOverflow = used + h > limit && page.length > 0;

		if (wouldOverflow) {
			pages.push([id]);
			used = h;
		} else {
			page.push(id);
			used += h;
		}
	}

	return pages;
}

export type TwoColumnPageSlot = {
	sidebarIds: string[];
	mainIds: string[];
};

/** Clé React stable pour une feuille 2 colonnes (contenu, pas l’index). */
export function twoColumnPageKey(page: TwoColumnPageSlot): string {
	const side = page.sidebarIds.join("+") || "_";
	const main = page.mainIds.join("+") || "_";
	return `2col-${side}__${main}`;
}

/**
 * Fusionne deux flux de pages (sidebar / main) en N feuilles.
 * Une colonne peut être vide sur les dernières pages (chrome conservé).
 */
export function mergeTwoColumnPages(
	sidebarPages: string[][],
	mainPages: string[][],
): TwoColumnPageSlot[] {
	const n = Math.max(sidebarPages.length, mainPages.length, 1);
	const slots: TwoColumnPageSlot[] = [];
	for (let i = 0; i < n; i++) {
		slots.push({
			sidebarIds: sidebarPages[i] ?? [],
			mainIds: mainPages[i] ?? [],
		});
	}
	return slots;
}
