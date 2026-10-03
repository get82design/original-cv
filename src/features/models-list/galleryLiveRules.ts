/** Au-delà de ce nombre de cartes affichées, le panneau Modifications se verrouille. */
export const GALLERY_MODIFICATIONS_MAX = 10;

/**
 * Verrou panneau Modifications : basé sur les cartes PNG affichées
 * (l’aperçu live ne démarre qu’à l’ouverture du panneau).
 */
export function isGalleryModificationsLocked(
	shownCount: number,
	max = GALLERY_MODIFICATIONS_MAX,
): boolean {
	return shownCount > max;
}

/**
 * Carte en mini-CV live si déjà montée.
 * Persiste après fermeture du panneau ; reset au changement de filtre.
 */
export function isGalleryCardLive(cardIndex: number, liveCount: number): boolean {
	return cardIndex < liveCount;
}

/** Continuer le montage progressif tant que la session live est armée. */
export function shouldProgressGalleryLive(
	liveArmed: boolean,
	liveCount: number,
	shownCount: number,
): boolean {
	return liveArmed && liveCount < shownCount;
}

/**
 * Si des mini-CV sont montés, différer le swap de liste :
 * d’abord peindre les PNG cibles, puis démonter le live hors écran.
 */
export function shouldDeferGalleryListSwap(liveCount: number): boolean {
	return liveCount > 0;
}
