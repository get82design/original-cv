import { describe, expect, it } from "vitest";
import { TemplateStyleCategory } from "../../generated/prisma/enums";
import {
	styleCategoryForTemplateName,
	TEMPLATE_STYLE_BY_NAME,
} from "../../prisma/seedDatas/cv-template/templateStyleCategories";

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
	"Amsterdam",
	"Rotterdam",
	"Dublin",
	"Antwerp",
	"Cologne",
	"Ghent",
	"Brussels",
	"Copenhagen",
	"Glasgow",
	"Bruges",
	"Porto",
	"Bilbao",
] as const;

describe("templateStyleCategories seed map", () => {
	it("couvre les 50 templates seed sans orphelin", () => {
		const mapNames = Object.keys(TEMPLATE_STYLE_BY_NAME).sort();
		expect(mapNames).toEqual([...EXPECTED_SEED_NAMES].sort());
		expect(mapNames).toHaveLength(50);
	});

	it("assigne les 5 styles marketing attendus", () => {
		expect(styleCategoryForTemplateName("Stockholm")).toBe(TemplateStyleCategory.CLASSIC);
		expect(styleCategoryForTemplateName("Austin")).toBe(TemplateStyleCategory.MODERN);
		expect(styleCategoryForTemplateName("Denver")).toBe(TemplateStyleCategory.CREATIVE);
		expect(styleCategoryForTemplateName("Singapore")).toBe(TemplateStyleCategory.PROFESSIONAL);
		expect(styleCategoryForTemplateName("Brussels")).toBe(TemplateStyleCategory.PROFESSIONAL);
		expect(styleCategoryForTemplateName("Copenhagen")).toBe(TemplateStyleCategory.PROFESSIONAL);
		expect(styleCategoryForTemplateName("Glasgow")).toBe(TemplateStyleCategory.PROFESSIONAL);
		expect(styleCategoryForTemplateName("Bruges")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Porto")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Bilbao")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Berlin")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Amsterdam")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Rotterdam")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Dublin")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Antwerp")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Cologne")).toBe(TemplateStyleCategory.BOLD);
		expect(styleCategoryForTemplateName("Ghent")).toBe(TemplateStyleCategory.BOLD);
	});

	it("throw si nom absent de la map", () => {
		expect(() => styleCategoryForTemplateName("VilleInconnue")).toThrow(/styleCategory manquant/);
	});
});
