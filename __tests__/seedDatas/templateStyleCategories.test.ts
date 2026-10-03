import { describe, expect, it } from "vitest";
import {
	TEMPLATE_STYLE_BY_NAME,
	styleCategoryForTemplateName,
} from "../../prisma/seedDatas/cv-template/templateStyleCategories";
import { TemplateStyleCategory } from "../../generated/prisma/enums";

/** Noms attendus = inventaire seed (tenir aligné avec seedTemplates). */
const EXPECTED_SEED_NAMES = [
	"Stockholm",
	"Kyoto",
	"Oslo",
	"Denver",
	"Seattle",
	"Seoul",
	"Geneva",
	"Austin",
	"Portland",
	"Tallinn",
	"Zurich",
	"Chicago",
	"Tokyo",
	"Lisbon",
	"Florence",
	"Helsinki",
	"Nara",
	"Reykjavik",
	"Krakow",
	"Shenzhen",
	"Eindhoven",
	"Oxford",
	"Singapore",
	"Toronto",
	"Frankfurt",
	"Berlin",
	"Hamburg",
	"Vienna",
	"Prague",
	"Budapest",
	"Madrid",
	"Barcelona",
	"Munich",
	"Milan",
	"Genoa",
	"Naples",
	"Lyon",
	"Bordeaux",
] as const;

describe("templateStyleCategories seed map", () => {
	it("couvre les 38 templates seed sans orphelin", () => {
		const mapNames = Object.keys(TEMPLATE_STYLE_BY_NAME).sort();
		expect(mapNames).toEqual([...EXPECTED_SEED_NAMES].sort());
		expect(mapNames).toHaveLength(38);
	});

	it("assigne les 5 styles marketing attendus", () => {
		expect(styleCategoryForTemplateName("Stockholm")).toBe(TemplateStyleCategory.CLASSIC);
		expect(styleCategoryForTemplateName("Austin")).toBe(TemplateStyleCategory.MODERN);
		expect(styleCategoryForTemplateName("Denver")).toBe(TemplateStyleCategory.CREATIVE);
		expect(styleCategoryForTemplateName("Singapore")).toBe(TemplateStyleCategory.PROFESSIONAL);
		expect(styleCategoryForTemplateName("Berlin")).toBe(TemplateStyleCategory.BOLD);
	});

	it("throw si nom absent de la map", () => {
		expect(() => styleCategoryForTemplateName("VilleInconnue")).toThrow(
			/styleCategory manquant/,
		);
	});
});
