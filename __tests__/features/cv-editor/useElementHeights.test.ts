import { describe, expect, it } from "vitest";
import { nextStableHeight } from "@/features/cv-editor/component/kit-dnd/shared/useElementHeights";

describe("nextStableHeight", () => {
	it("accepte la première mesure", () => {
		expect(nextStableHeight(undefined, 140.4)).toBe(140);
	});

	it("ignore une mesure identique après round", () => {
		expect(nextStableHeight(140, 140.4)).toBeNull();
	});

	it("ignore une oscillation de 1px (anti-boucle ResizeObserver)", () => {
		expect(nextStableHeight(150, 151)).toBeNull();
		expect(nextStableHeight(151, 150.2)).toBeNull();
	});

	it("accepte un vrai changement de hauteur", () => {
		expect(nextStableHeight(140, 180)).toBe(180);
		expect(nextStableHeight(200, 100)).toBe(100);
	});
});
