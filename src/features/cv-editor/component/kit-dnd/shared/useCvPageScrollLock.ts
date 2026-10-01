import { useCallback, useEffect, useRef, useState } from "react";

function mapsEqual(a: Map<string, number>, b: Map<string, number>): boolean {
	if (a === b) return true;
	if (a.size !== b.size) return false;
	for (const [k, v] of a) {
		if (b.get(k) !== v) return false;
	}
	return true;
}

/** Hauteurs stabilisées (évite un re-pack à chaque toolbar / bouton +). */
export function useDebouncedHeights(heights: Map<string, number>, delayMs = 120) {
	const [stable, setStable] = useState(heights);
	useEffect(() => {
		const t = window.setTimeout(() => {
			setStable((prev) => (mapsEqual(prev, heights) ? prev : heights));
		}, delayMs);
		return () => window.clearTimeout(t);
	}, [heights, delayMs]);
	return stable;
}

/**
 * Pendant qu’une section est sélectionnée, on ne reclasse pas les pages
 * (toolbar / bouton « + » changent la hauteur et provoquaient un jump scroll).
 */
export function useFrozenPackingHeights(
	stableHeights: Map<string, number>,
	sectionSelected: string,
) {
	const frozenRef = useRef(stableHeights);
	if (!sectionSelected) {
		frozenRef.current = stableHeights;
	}
	return sectionSelected ? frozenRef.current : stableHeights;
}

const LOCK_MS = 500;

/**
 * Empêche le navigateur de remonter en haut au clic / focus dans le CV.
 * Verrouille Y au pointerdown et force le restore sur tout scroll pendant ~500ms.
 */
export function useCvPageScrollLock() {
	const lockedYRef = useRef(0);
	const lockedUntilRef = useRef(0);

	const lockScrollBeforeSelect = useCallback((y = window.scrollY) => {
		lockedYRef.current = y;
		lockedUntilRef.current = Date.now() + LOCK_MS;
	}, []);

	useEffect(() => {
		const isLocked = () => Date.now() < lockedUntilRef.current;

		const restore = () => {
			if (!isLocked()) return;
			const y = lockedYRef.current;
			if (Math.abs(window.scrollY - y) > 0.5) {
				window.scrollTo({ top: y, left: window.scrollX, behavior: "auto" });
			}
		};

		const onPointerDown = (e: PointerEvent) => {
			const t = e.target;
			if (!(t instanceof Element)) return;
			if (!t.closest(".cv-page-document")) return;
			lockedYRef.current = window.scrollY;
			lockedUntilRef.current = Date.now() + LOCK_MS;
		};

		const onScroll = () => {
			if (isLocked()) restore();
		};

		const onFocusIn = (e: FocusEvent) => {
			const t = e.target;
			if (!(t instanceof Element)) return;
			if (!t.closest(".cv-page-document")) return;
			if (!isLocked()) {
				lockedYRef.current = window.scrollY;
				lockedUntilRef.current = Date.now() + LOCK_MS;
			}
			restore();
			requestAnimationFrame(() => {
				restore();
				requestAnimationFrame(restore);
			});
			window.setTimeout(restore, 50);
			window.setTimeout(restore, 150);
			window.setTimeout(restore, 300);
		};

		document.addEventListener("pointerdown", onPointerDown, true);
		window.addEventListener("scroll", onScroll, { passive: true });
		document.addEventListener("focusin", onFocusIn, true);

		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			window.removeEventListener("scroll", onScroll);
			document.removeEventListener("focusin", onFocusIn, true);
		};
	}, []);

	return { lockScrollBeforeSelect };
}
