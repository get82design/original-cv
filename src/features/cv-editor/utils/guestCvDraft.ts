import type { CvFormValues } from "@/services/schemas/cvSave.schema";

const KEY = "original-cv:guest-draft";

export function saveGuestCvDraft(cv: CvFormValues) {
	const { photo: _photo, ...rest } = cv;
	try {
		localStorage.setItem(KEY, JSON.stringify({ ...rest, cvId: undefined }));
	} catch {
		/* quota */
	}
}

export function loadGuestCvDraft(): CvFormValues | null {
	if (typeof window === "undefined") return null;
	const raw = localStorage.getItem(KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as CvFormValues;
	} catch {
		return null;
	}
}

export function hasGuestCvDraft() {
	if (typeof window === "undefined") return false;
	return localStorage.getItem(KEY) != null;
}

export function clearGuestCvDraft() {
	localStorage.removeItem(KEY);
}
