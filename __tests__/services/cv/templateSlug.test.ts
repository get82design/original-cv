import { describe, expect, it } from "vitest";
import { slugifyTemplateName } from "../../../src/services/cv/templateSlug";

describe("slugifyTemplateName", () => {
	it("lowercases simple names", () => {
		expect(slugifyTemplateName("Berlin")).toBe("berlin");
	});

	it("strips accents and spaces", () => {
		expect(slugifyTemplateName("  Modèle Classique ")).toBe("modele-classique");
	});

	it("collapses punctuation", () => {
		expect(slugifyTemplateName("Foo_Bar!!Baz")).toBe("foo-bar-baz");
	});
});
