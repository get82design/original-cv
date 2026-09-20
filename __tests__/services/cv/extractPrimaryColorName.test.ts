import { describe, expect, it } from "vitest";
import { extractPrimaryColorName } from "../../../src/services/cv/extractPrimaryColorName";

describe("extractPrimaryColorName", () => {
	it("reads from layoutGeneral.defaultStyles.primaryColor.name", () => {
		expect(
			extractPrimaryColorName({
				defaultStyles: {
					primaryColor: { name: "blue", primary: "-600" },
				},
			}),
		).toBe("blue");
	});

	it("reads from template defaultStyles shape", () => {
		expect(
			extractPrimaryColorName({
				primaryColor: { name: "olive", primary: "-700" },
				slugTemplate: "frankfurt",
			}),
		).toBe("olive");
	});

	it("returns null when missing", () => {
		expect(extractPrimaryColorName(null)).toBeNull();
		expect(extractPrimaryColorName({})).toBeNull();
		expect(
			extractPrimaryColorName({
				defaultStyles: { primaryColor: { name: "  " } },
			}),
		).toBeNull();
	});
});
