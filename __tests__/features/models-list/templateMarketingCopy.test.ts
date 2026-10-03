import { describe, expect, it } from "vitest";
import { TemplateStyleCategory } from "../../../generated/prisma/enums";
import { buildTemplateMarketingCopy } from "../../../src/features/models-list/templateMarketingCopy";

describe("buildTemplateMarketingCopy", () => {
	it("builds title and description for a free 1-col template", () => {
		const copy = buildTemplateMarketingCopy({
			name: "Oslo",
			columns: 1,
			isPremium: false,
			isFeatured: false,
			styleCategory: TemplateStyleCategory.CLASSIC,
		});
		expect(copy.title).toContain("Oslo");
		expect(copy.description).toContain("1 colonne");
		expect(copy.description).toContain("classique");
		expect(copy.description).toContain("gratuit");
		expect(copy.blurb).toContain("Oslo");
	});

	it("mentions premium and featured", () => {
		const copy = buildTemplateMarketingCopy({
			name: "Berlin",
			columns: 2,
			isPremium: true,
			isFeatured: true,
			styleCategory: TemplateStyleCategory.BOLD,
		});
		expect(copy.description).toContain("2 colonnes");
		expect(copy.description).toContain("audacieux");
		expect(copy.description).toContain("premium");
		expect(copy.blurb).toContain("Mis en avant");
	});
});
