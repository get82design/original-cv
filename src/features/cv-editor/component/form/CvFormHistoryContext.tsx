import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type PropsWithChildren,
} from "react";
import { useFormContext } from "react-hook-form";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import {
	createEmptyCvFormHistory,
	pushCvFormHistory,
	redoCvFormHistory,
	undoCvFormHistory,
	type CvFormHistoryState,
} from "../../utils/cvFormHistory";
import {
	bindCvFormHistoryClear,
	bindCvFormHistoryCommit,
} from "../../utils/cvFormHistoryCommit";

type CvFormHistoryContextValue = {
	canUndo: boolean;
	canRedo: boolean;
	/** Snapshot l’état courant avant une action discrète. */
	commit: () => void;
	undo: () => void;
	redo: () => void;
	/** Vide la pile (load CV, save réussi…). */
	clear: () => void;
};

const CvFormHistoryContext = createContext<CvFormHistoryContextValue | null>(null);

export function useCvFormHistory() {
	const ctx = useContext(CvFormHistoryContext);
	if (!ctx) {
		throw new Error("useCvFormHistory doit être utilisé dans CvFormHistoryProvider");
	}
	return ctx;
}

export function CvFormHistoryProvider({ children }: PropsWithChildren) {
	const { getValues, reset } = useFormContext<CvFormValues>();
	const [state, setState] = useState<CvFormHistoryState>(createEmptyCvFormHistory);
	const stateRef = useRef(state);
	stateRef.current = state;
	/** Ignore les commits pendant undo/redo. */
	const applyingRef = useRef(false);

	const commit = useCallback(() => {
		if (applyingRef.current) return;
		const next = pushCvFormHistory(stateRef.current, getValues());
		stateRef.current = next;
		setState(next);
	}, [getValues]);

	const clear = useCallback(() => {
		const empty = createEmptyCvFormHistory();
		stateRef.current = empty;
		setState(empty);
	}, []);

	const undo = useCallback(() => {
		const result = undoCvFormHistory(stateRef.current, getValues());
		if (!result) return;
		applyingRef.current = true;
		stateRef.current = result.nextState;
		setState(result.nextState);
		reset(result.restore);
		queueMicrotask(() => {
			applyingRef.current = false;
		});
	}, [getValues, reset]);

	const redo = useCallback(() => {
		const result = redoCvFormHistory(stateRef.current, getValues());
		if (!result) return;
		applyingRef.current = true;
		stateRef.current = result.nextState;
		setState(result.nextState);
		reset(result.restore);
		queueMicrotask(() => {
			applyingRef.current = false;
		});
	}, [getValues, reset]);

	useEffect(() => {
		bindCvFormHistoryCommit(commit);
		bindCvFormHistoryClear(clear);
		return () => {
			bindCvFormHistoryCommit(null);
			bindCvFormHistoryClear(null);
		};
	}, [commit, clear]);

	const value = useMemo<CvFormHistoryContextValue>(
		() => ({
			canUndo: state.past.length > 0,
			canRedo: state.future.length > 0,
			commit,
			undo,
			redo,
			clear,
		}),
		[state.past.length, state.future.length, commit, undo, redo, clear],
	);

	return (
		<CvFormHistoryContext.Provider value={value}>{children}</CvFormHistoryContext.Provider>
	);
}
