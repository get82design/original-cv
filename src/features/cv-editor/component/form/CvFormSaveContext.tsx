import { createContext, useContext } from "react";

/** Sauvegarde explicite uniquement (pas de submit HTML implicite). */
const CvFormSaveContext = createContext<{ requestSave: () => void } | null>(null);

export function useCvFormSave() {
	const ctx = useContext(CvFormSaveContext);
	if (!ctx) {
		throw new Error("useCvFormSave doit être utilisé dans FormCv");
	}
	return ctx;
}

export const CvFormSaveProvider = CvFormSaveContext.Provider;
