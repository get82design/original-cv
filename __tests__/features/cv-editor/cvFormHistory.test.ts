import { describe, expect, it } from "vitest";
import {
	CV_FORM_HISTORY_MAX,
	createEmptyCvFormHistory,
	mergeHistorySnapshot,
	pushCvFormHistory,
	redoCvFormHistory,
	snapshotCvFormForHistory,
	undoCvFormHistory,
} from "@/features/cv-editor/utils/cvFormHistory";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";

function fakeCv({
	title,
	photo,
	datas,
	modules,
	...rest
}: Partial<CvFormValues> & { title: string }): CvFormValues {
	return {
		templateId: "t1",
		title,
		photo: photo ?? "data:image/png;base64,AAA",
		datas: datas ?? {},
		modules: modules ?? [],
		...rest,
	} as CvFormValues;
}

describe("snapshotCvFormForHistory", () => {
	it("clone sans photo", () => {
		const snap = snapshotCvFormForHistory(fakeCv({ title: "A" }));
		expect(snap.title).toBe("A");
		expect(snap.photo).toBeUndefined();
	});
});

describe("mergeHistorySnapshot", () => {
	it("conserve la photo courante", () => {
		const current = fakeCv({ title: "now", photo: "photo-now" });
		const snap = snapshotCvFormForHistory(fakeCv({ title: "old", photo: "photo-old" }));
		const merged = mergeHistorySnapshot(current, snap);
		expect(merged.title).toBe("old");
		expect(merged.photo).toBe("photo-now");
	});
});

describe("push / undo / redo", () => {
	it("push puis undo restaure l’état précédent", () => {
		let hist = createEmptyCvFormHistory();
		const v1 = fakeCv({ title: "v1" });
		const v2 = fakeCv({ title: "v2" });

		hist = pushCvFormHistory(hist, v1);
		expect(hist.past).toHaveLength(1);

		const undone = undoCvFormHistory(hist, v2);
		expect(undone).not.toBeNull();
		expect(undone!.restore.title).toBe("v1");
		expect(undone!.nextState.past).toHaveLength(0);
		expect(undone!.nextState.future).toHaveLength(1);
	});

	it("redo annule un undo", () => {
		let hist = createEmptyCvFormHistory();
		hist = pushCvFormHistory(hist, fakeCv({ title: "v1" }));
		const afterUndo = undoCvFormHistory(hist, fakeCv({ title: "v2" }));
		expect(afterUndo).not.toBeNull();

		const redone = redoCvFormHistory(afterUndo!.nextState, afterUndo!.restore);
		expect(redone).not.toBeNull();
		expect(redone!.restore.title).toBe("v2");
		expect(redone!.nextState.past).toHaveLength(1);
		expect(redone!.nextState.future).toHaveLength(0);
	});

	it("un nouveau push vide le futur", () => {
		let hist = createEmptyCvFormHistory();
		hist = pushCvFormHistory(hist, fakeCv({ title: "v1" }));
		const afterUndo = undoCvFormHistory(hist, fakeCv({ title: "v2" }));
		hist = pushCvFormHistory(afterUndo!.nextState, afterUndo!.restore);
		expect(hist.future).toHaveLength(0);
		expect(hist.past).toHaveLength(1);
	});

	it("respecte la taille max", () => {
		let hist = createEmptyCvFormHistory();
		for (let i = 0; i < CV_FORM_HISTORY_MAX + 5; i++) {
			hist = pushCvFormHistory(hist, fakeCv({ title: `v${i}` }));
		}
		expect(hist.past).toHaveLength(CV_FORM_HISTORY_MAX);
		expect(hist.past[0]?.title).toBe("v5");
	});

	it("undo/redo no-op si pile vide", () => {
		const empty = createEmptyCvFormHistory();
		const cv = fakeCv({ title: "x" });
		expect(undoCvFormHistory(empty, cv)).toBeNull();
		expect(redoCvFormHistory(empty, cv)).toBeNull();
	});
});
