import { describe, expect, it } from "vitest";
import {
	CV_SIGNATURE_MAX_FOOTPRINT_PX,
	CV_SIGNATURE_VARIANTS,
	cvSignatureStyle,
} from "@/features/cv-editor/utils/cvSignatureVariants";

const TEAL = { name: "teal", primary: "-600" };

describe("CV_SIGNATURE_VARIANTS", () => {
	it("expose 3 variantes aux ids uniques", () => {
		const ids = CV_SIGNATURE_VARIANTS.map((v) => v.id);
		expect(ids).toEqual(["minimal", "band", "corners"]);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe("cvSignatureStyle", () => {
	it("minimal : aucun décor, texte noir", () => {
		const style = cvSignatureStyle("minimal", TEAL);
		expect(style.decoration).toBe("none");
		expect(style.decorationHeight).toBe(0);
		expect(style.textColor).toBe("#1d1d1b");
	});

	it("band : bande en 200 et texte noir imposé", () => {
		const style = cvSignatureStyle("band", TEAL);
		expect(style.decoration).toBe("band");
		expect(style.tintLight).toBe("var(--teal-200)");
		expect(style.textColor).toBe("#1d1d1b");
		// La ligne est centrée dans la bande : même hauteur, pas de décalage.
		expect(style.rowBottom).toBe(0);
		expect(style.rowHeight).toBe(style.decorationHeight);
	});

	it("corners : triangles en 600 / 300, ligne plus basse dans la zone centrale", () => {
		const style = cvSignatureStyle("corners", TEAL);
		expect(style.decoration).toBe("corners");
		expect(style.tintDeep).toBe("var(--teal-600)");
		expect(style.tintLight).toBe("var(--teal-300)");
		expect(style.textColor).toBe("#1d1d1b");
		// Triangles plus hauts que la ligne : le texte reste dans l'espace blanc central.
		expect(style.decorationHeight).toBeGreaterThan(style.rowBottom + style.rowHeight);
	});

	it("texte noir sur les 3 variantes", () => {
		for (const variant of CV_SIGNATURE_VARIANTS) {
			expect(cvSignatureStyle(variant.id, TEAL).textColor).toBe("#1d1d1b");
		}
	});

	it("respecte la nuance principale choisie dans le layout", () => {
		expect(cvSignatureStyle("corners", { name: "rose", primary: "-500" }).tintDeep).toBe(
			"var(--rose-500)",
		);
	});

	it("retombe sur le gris sans couleur primaire ou en noir", () => {
		for (const primary of [null, undefined, { name: "black", primary: "-600" }]) {
			const style = cvSignatureStyle("corners", primary);
			expect(style.tintDeep).toBe("var(--gray-700)");
			expect(style.tintLight).toBe("var(--gray-300)");
		}
	});

	it("aucune variante ne dépasse la réserve bas de page", () => {
		for (const variant of CV_SIGNATURE_VARIANTS) {
			const style = cvSignatureStyle(variant.id, TEAL);
			const footprint = Math.max(style.decorationHeight, style.rowBottom + style.rowHeight);
			expect(footprint).toBeLessThanOrEqual(CV_SIGNATURE_MAX_FOOTPRINT_PX);
		}
	});
});
