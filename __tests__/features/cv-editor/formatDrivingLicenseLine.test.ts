import { describe, expect, it } from "vitest";
import {
	formatDrivingLicenseLine,
	hasDrivingLicenseInfo,
} from "../../../src/features/cv-editor/utils/formatDrivingLicenseLine";

describe("formatDrivingLicenseLine", () => {
	it("retourne une chaîne vide si rien", () => {
		expect(formatDrivingLicenseLine([], false)).toBe("");
		expect(formatDrivingLicenseLine(undefined, false)).toBe("");
	});

	it("formate les permis seuls", () => {
		expect(formatDrivingLicenseLine(["B", "BE"], false)).toBe("Permis B, BE");
	});

	it("formate véhiculé seul", () => {
		expect(formatDrivingLicenseLine([], true)).toBe("Véhiculé");
	});

	it("combine permis et véhiculé", () => {
		expect(formatDrivingLicenseLine(["B"], true)).toBe("Permis B · Véhiculé");
	});
});

describe("hasDrivingLicenseInfo", () => {
	it("détecte la présence d’info", () => {
		expect(hasDrivingLicenseInfo([], false)).toBe(false);
		expect(hasDrivingLicenseInfo(["B"], false)).toBe(true);
		expect(hasDrivingLicenseInfo([], true)).toBe(true);
	});
});
