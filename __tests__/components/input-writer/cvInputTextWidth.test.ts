import { describe, expect, it } from "vitest";
import { cvInputTextWidth } from "@/components/input-writer/input-text-cv/cvInputTextWidth";

describe("cvInputTextWidth", () => {
	it("prend toute la largeur si forceWidthFull", () => {
		expect(cvInputTextWidth(undefined, "Prenom", true)).toBe("100%");
	});

	it("utilise le placeholder quand le champ est vide ou absent", () => {
		expect(cvInputTextWidth(undefined, "Prenom", false)).toBe("6ch");
		expect(cvInputTextWidth(null, "Nom", false)).toBe("3ch");
		expect(cvInputTextWidth("", "email", false)).toBe("5ch");
	});

	it("suit la longueur du texte saisi", () => {
		expect(cvInputTextWidth("Marie", "Prenom", false)).toBe("5ch");
	});

	it("retombe sur 0ch sans placeholder ni texte", () => {
		expect(cvInputTextWidth(undefined, undefined, false)).toBe("0ch");
	});
});
