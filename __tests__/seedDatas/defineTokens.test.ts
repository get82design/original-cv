import { describe, expect, it } from "vitest";
import {
	headerFourTokenDefaults,
	headerOneTokenDefaults,
	headerSplitOneTokenDefaults,
	headerThreeTokenDefaults,
	mergeTokenOverrides,
} from "../../prisma/seedDatas/headerTokenDefaults";
import {
	berlinTokens,
	chicagoTokens,
	defaultTokens,
	defineTokens,
	denverTokens,
	kyotoTokens,
	florenceTokens,
	lisbonTokens,
	osloTokens,
	seattleTokens,
	stockholmTokens,
	viennaTokens,
} from "../../prisma/seedDatas/themeTokens";

describe("defineTokens", () => {
	it("sans override, équivaut à defaultTokens", () => {
		expect(defineTokens()).toEqual(defaultTokens);
	});

	it("merge partiel un rôle sans écraser les autres champs", () => {
		const tokens = defineTokens({
			sectionTitle: { colorSelect: "black" },
		});
		expect(tokens.sectionTitle).toEqual({
			...defaultTokens.sectionTitle,
			colorSelect: "black",
		});
		expect(tokens.body).toEqual(defaultTokens.body);
	});

	it("ne mute pas defaultTokens", () => {
		const before = structuredClone(defaultTokens);
		defineTokens({ headerTitle: { textAlign: "center" } });
		expect(defaultTokens).toEqual(before);
	});

	it("Stockholm / Kyoto / Oslo — deltas attendus", () => {
		expect(stockholmTokens.headerTitle.textAlign).toBe("center");
		expect(stockholmTokens.sectionTitle.colorSelect).toBe("black");
		expect(stockholmTokens.body).toEqual(defaultTokens.body);

		expect(kyotoTokens.headerTitle.weightSelect).toBe("lg");
		expect(kyotoTokens.sectionTitle.colorSelect).toBe("black");
		expect(kyotoTokens.headerTitle.textAlign).toBe(
			defaultTokens.headerTitle.textAlign,
		);

		expect(osloTokens.headerTitle.textAlign).toBe("center");
		expect(osloTokens.headerTitle.weightSelect).toBe("md");
		expect(osloTokens.headerSubTitle.sizeSelect).toBe("lg");
		expect(osloTokens.sectionTitle).toEqual(defaultTokens.sectionTitle);
	});

	it("Denver reste HeaderThree ; Seattle suit HeaderSplitOne (Berlin)", () => {
		expect(denverTokens.sectionTitle.colorSelect).toBe("black");
		expect(denverTokens.headerNom.sizeModel).toBe("24px");
		expect(seattleTokens).toEqual(berlinTokens);
	});

	it("Chicago — seul le header identité change", () => {
		expect(chicagoTokens.headerNom.textAlign).toBe("right");
		expect(chicagoTokens.sectionTitle).toEqual(defaultTokens.sectionTitle);
		expect(chicagoTokens.body).toEqual(defaultTokens.body);
	});

	it("Vienna utilise HeaderOne (pas Berlin)", () => {
		expect(viennaTokens).toEqual(
			defineTokens(mergeTokenOverrides(headerOneTokenDefaults)),
		);
		expect(viennaTokens.headerTitle.weightSelect).toBe("lg");
		expect(viennaTokens).not.toEqual(berlinTokens);
	});

	it("presets header produisent le même résultat que les thèmes branchés", () => {
		expect(kyotoTokens.headerTitle).toEqual(
			defineTokens(mergeTokenOverrides(headerOneTokenDefaults)).headerTitle,
		);
		expect(chicagoTokens).toEqual(
			defineTokens(mergeTokenOverrides(headerFourTokenDefaults)),
		);
		expect(denverTokens.headerNom).toEqual(
			defineTokens(mergeTokenOverrides(headerThreeTokenDefaults)).headerNom,
		);
		expect(seattleTokens.headerTitle).toEqual(
			defineTokens(mergeTokenOverrides(headerSplitOneTokenDefaults)).headerTitle,
		);
		expect(florenceTokens).toEqual(
			defineTokens(mergeTokenOverrides(headerOneTokenDefaults)),
		);
		expect(lisbonTokens.headerNom).toEqual(
			defineTokens(mergeTokenOverrides(headerThreeTokenDefaults)).headerNom,
		);
	});
});
