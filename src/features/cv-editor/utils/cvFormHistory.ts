import type { CvFormValues } from "@/services/schemas/cvSave.schema";

/** Taille max de la pile (past). Au-delà, on drop le plus ancien. */
export const CV_FORM_HISTORY_MAX = 30;

export type CvFormHistorySnapshot = CvFormValues;

export type CvFormHistoryState = {
	past: CvFormHistorySnapshot[];
	future: CvFormHistorySnapshot[];
};

export function createEmptyCvFormHistory(): CvFormHistoryState {
	return { past: [], future: [] };
}

/** Snapshot mémoire : sans photo (trop lourd). */
export function snapshotCvFormForHistory(cv: CvFormValues): CvFormHistorySnapshot {
	const { photo: _photo, ...rest } = cv;
	return structuredClone(rest) as CvFormValues;
}

/** Réapplique un snapshot en conservant la photo courante. */
export function mergeHistorySnapshot(
	current: CvFormValues,
	snap: CvFormHistorySnapshot,
): CvFormValues {
	return { ...structuredClone(snap), photo: current.photo };
}

/**
 * Enregistre l’état courant avant une action discrète.
 * Vide le futur (branchement classique undo/redo).
 */
export function pushCvFormHistory(
	state: CvFormHistoryState,
	current: CvFormValues,
	max = CV_FORM_HISTORY_MAX,
): CvFormHistoryState {
	const snap = snapshotCvFormForHistory(current);
	const past = [...state.past, snap];
	if (past.length > max) past.shift();
	return { past, future: [] };
}

export function undoCvFormHistory(
	state: CvFormHistoryState,
	current: CvFormValues,
): { nextState: CvFormHistoryState; restore: CvFormValues } | null {
	if (state.past.length === 0) return null;
	const past = [...state.past];
	const target = past.pop()!;
	const future = [snapshotCvFormForHistory(current), ...state.future];
	return {
		nextState: { past, future },
		restore: mergeHistorySnapshot(current, target),
	};
}

export function redoCvFormHistory(
	state: CvFormHistoryState,
	current: CvFormValues,
): { nextState: CvFormHistoryState; restore: CvFormValues } | null {
	if (state.future.length === 0) return null;
	const future = [...state.future];
	const target = future.shift()!;
	const past = [...state.past, snapshotCvFormForHistory(current)];
	return {
		nextState: { past, future },
		restore: mergeHistorySnapshot(current, target),
	};
}
