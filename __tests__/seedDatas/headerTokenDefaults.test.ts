import { describe, expect, it } from "vitest";
import {
	headerFiveTokenDefaults,
	headerFourTokenDefaults,
	headerOneTokenDefaults,
	headerSplitOneTokenDefaults,
	headerThreeTokenDefaults,
	headerTwoTokenDefaults,
	mergeTokenOverrides,
} from "../../prisma/seedDatas/headerTokenDefaults";
import { defineTokens, defaultTokens } from "../../prisma/seedDatas/themeTokens";

describe("headerTokenDefaults", () => {
	it("expose un preset par sectionHeader du catalogue", () => {
		expect(headerOneTokenDefaults.headerTitle?.weightSelect).toBe("lg");
		expect(headerTwoTokenDefaults.headerTitle?.textAlign).toBe("center");
		expect(headerThreeTokenDefaults.headerNom?.sizeModel).toBe("24px");
		expect(headerFourTokenDefaults.headerNom?.textAlign).toBe("right");
		expect(headerFiveTokenDefaults.headerTitle?.textAlign).toBe("center");
		expect(headerSplitOneTokenDefaults.headerNom?.sizeModel).toBe("26px");
	});

	it("mergeTokenOverrides fusionne les rôles sans écraser les autres clés", () => {
		const merged = mergeTokenOverrides(headerOneTokenDefaults, {
			headerTitle: { textAlign: "center" },
			sectionTitle: { colorSelect: "black" },
		});
		expect(merged.headerTitle).toEqual({
			weightSelect: "lg",
			textAlign: "center",
		});
		expect(merged.headerSubTitle).toEqual({ weightSelect: "sm" });
		expect(merged.sectionTitle).toEqual({ colorSelect: "black" });
	});

	it("defineTokens + preset HeaderFour produit le bloc identité attendu", () => {
		const tokens = defineTokens(mergeTokenOverrides(headerFourTokenDefaults));
		expect(tokens.headerNom.textAlign).toBe("right");
		expect(tokens.headerNom.sizeModel).toBe("28px");
		expect(tokens.sectionTitle).toEqual(defaultTokens.sectionTitle);
	});
});
