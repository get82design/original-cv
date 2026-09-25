import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Observe la hauteur d’éléments DOM (header + sections) via ResizeObserver.
 * Renvoie une Map id → height et un callback ref factory stable par id.
 */
export function useElementHeights(ids: string[]) {
	const [heights, setHeights] = useState<Map<string, number>>(() => new Map());
	const observers = useRef<Map<string, ResizeObserver>>(new Map());
	const nodes = useRef<Map<string, HTMLElement>>(new Map());
	const refCallbacks = useRef<Map<string, (el: HTMLElement | null) => void>>(new Map());
	const idsKey = ids.join("\0");

	const applyHeight = useCallback((id: string, h: number) => {
		const rounded = Math.ceil(h);
		setHeights((prev) => {
			if (prev.get(id) === rounded) return prev;
			const next = new Map(prev);
			next.set(id, rounded);
			return next;
		});
	}, []);

	const disconnectAll = useCallback(() => {
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
						const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
						applyHeight(id, h);
					});
					ro.observe(el);
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
