import { useCallback, useLayoutEffect, useRef, useState } from "react";

/** Décide si une nouvelle mesure doit remplacer la hauteur connue (anti-oscillation). */
export function nextStableHeight(current: number | undefined, raw: number): number | null {
	const rounded = Math.round(raw);
	if (current === rounded) return null;
	if (current != null && Math.abs(current - rounded) < 2) return null;
	return rounded;
}

/**
 * Observe la hauteur d’éléments DOM (header + sections) via ResizeObserver.
 * Renvoie une Map id → height et un callback ref factory stable par id.
 *
 * Garde-fous anti-boucle (RO → setState → layout → RO) :
 * - flush groupé en rAF (un seul setState par frame)
 * - hystérésis 2px (évite l’oscillation  N / N+1 )
 */
export function useElementHeights(ids: string[]) {
	const [heights, setHeights] = useState<Map<string, number>>(() => new Map());
	const heightsRef = useRef(heights);
	heightsRef.current = heights;

	const observers = useRef<Map<string, ResizeObserver>>(new Map());
	const nodes = useRef<Map<string, HTMLElement>>(new Map());
	const refCallbacks = useRef<Map<string, (el: HTMLElement | null) => void>>(new Map());
	const pending = useRef<Map<string, number>>(new Map());
	const rafId = useRef<number | null>(null);
	const idsKey = ids.join("\0");

	const flush = useCallback(() => {
		rafId.current = null;
		if (pending.current.size === 0) return;
		const batch = pending.current;
		pending.current = new Map();
		setHeights((prev) => {
			let next: Map<string, number> | null = null;
			for (const [id, rounded] of batch) {
				if (prev.get(id) === rounded) continue;
				if (!next) next = new Map(prev);
				next.set(id, rounded);
			}
			return next ?? prev;
		});
	}, []);

	const applyHeight = useCallback(
		(id: string, h: number) => {
			const current = pending.current.get(id) ?? heightsRef.current.get(id);
			const next = nextStableHeight(current, h);
			if (next == null) return;

			pending.current.set(id, next);
			if (rafId.current == null) {
				rafId.current = window.requestAnimationFrame(flush);
			}
		},
		[flush],
	);

	const disconnectAll = useCallback(() => {
		if (rafId.current != null) {
			window.cancelAnimationFrame(rafId.current);
			rafId.current = null;
		}
		pending.current.clear();
		for (const obs of observers.current.values()) obs.disconnect();
		observers.current.clear();
		nodes.current.clear();
	}, []);

	useLayoutEffect(() => {
		const currentIds = idsKey === "" ? [] : idsKey.split("\0");
		for (const id of [...observers.current.keys()]) {
			if (!currentIds.includes(id)) {
				observers.current.get(id)?.disconnect();
				observers.current.delete(id);
				nodes.current.delete(id);
				refCallbacks.current.delete(id);
				pending.current.delete(id);
				setHeights((prev) => {
					if (!prev.has(id)) return prev;
					const next = new Map(prev);
					next.delete(id);
					return next;
				});
			}
		}
	}, [idsKey]);

	useLayoutEffect(() => () => disconnectAll(), [disconnectAll]);

	const setMeasureRef = useCallback(
		(id: string) => {
			let cb = refCallbacks.current.get(id);
			if (!cb) {
				cb = (el: HTMLElement | null) => {
					const prev = nodes.current.get(id);
					if (prev === el) return;

					observers.current.get(id)?.disconnect();
					observers.current.delete(id);
					if (!el) {
						nodes.current.delete(id);
						return;
					}

					nodes.current.set(id, el);
					const ro = new ResizeObserver((entries) => {
						const entry = entries[0];
						if (!entry) return;
						// Une seule source : borderBox si dispo (évite écart vs getBoundingClientRect).
						const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
						applyHeight(id, h);
					});
					ro.observe(el, { box: "border-box" });
					observers.current.set(id, ro);
					applyHeight(id, el.getBoundingClientRect().height);
				};
				refCallbacks.current.set(id, cb);
			}
			return cb;
		},
		[applyHeight],
	);

	return { heights, setMeasureRef };
}
