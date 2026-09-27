/**
 * Pont léger pour commit/clear hors hooks React (DnD, syncModif, FormCv…).
 * Bindé par `CvFormHistoryProvider`.
 */
let commitHandler: (() => void) | null = null;
let clearHandler: (() => void) | null = null;

export function bindCvFormHistoryCommit(handler: (() => void) | null) {
	commitHandler = handler;
}

export function bindCvFormHistoryClear(handler: (() => void) | null) {
	clearHandler = handler;
}

/** À appeler juste avant une mutation discrète du formulaire CV. */
export function commitCvFormHistory() {
	commitHandler?.();
}

/** Vide la pile (load / save = nouvelle baseline). */
export function clearCvFormHistory() {
	clearHandler?.();
}
