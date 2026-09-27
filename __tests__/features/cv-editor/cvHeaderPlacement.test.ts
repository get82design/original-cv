import { describe, expect, it } from "vitest";
import {
	HEADER_FALLBACK_PX,
	HEADER_SIDEBAR_ID,
	HEADER_SPLIT_MAIN_ID,
	HEADER_SPLIT_SIDEBAR_ID,
	HEADER_TOP_ID,
	headerMeasureIds,
	resolveTwoColumnHeaderHeights,
} from "@/features/cv-editor/utils/cvHeaderPlacement";

describe("headerMeasureIds", () => {
	it("mesure un seul bloc pour top et sidebar", () => {
		expect(headerMeasureIds("top")).toEqual([HEADER_TOP_ID]);
		expect(headerMeasureIds("sidebar")).toEqual([HEADER_SIDEBAR_ID]);
	});

	it("mesure les deux slots en split", () => {
		expect(headerMeasureIds("split")).toEqual([HEADER_SPLIT_SIDEBAR_ID, HEADER_SPLIT_MAIN_ID]);
	});
});

describe("resolveTwoColumnHeaderHeights", () => {
	it("top : header hors flux des colonnes", () => {
		const heights = new Map([[HEADER_TOP_ID, 300]]);
		expect(resolveTwoColumnHeaderHeights("top", heights)).toEqual({
			top: 300,
			sidebar: 0,
			main: 0,
		});
	});

	it("top : estimation tant que le header n’est pas mesuré", () => {
		expect(resolveTwoColumnHeaderHeights("top", new Map()).top).toBe(HEADER_FALLBACK_PX.top);
	});

	it("sidebar : réserve uniquement la colonne sidebar", () => {
		const heights = new Map([[HEADER_SIDEBAR_ID, 260]]);
		expect(resolveTwoColumnHeaderHeights("sidebar", heights)).toEqual({
			top: 0,
			sidebar: 260,
			main: 0,
		});
	});

	it("split : réserve les deux colonnes, rien hors flux", () => {
		const heights = new Map([
			[HEADER_SPLIT_SIDEBAR_ID, 210],
			[HEADER_SPLIT_MAIN_ID, 130],
		]);
		expect(resolveTwoColumnHeaderHeights("split", heights)).toEqual({
			top: 0,
			sidebar: 210,
			main: 130,
		});
	});

	it("split : estimation par slot non mesuré", () => {
		const heights = new Map([[HEADER_SPLIT_SIDEBAR_ID, 210]]);
		expect(resolveTwoColumnHeaderHeights("split", heights)).toEqual({
			top: 0,
			sidebar: 210,
			main: HEADER_FALLBACK_PX.splitMain,
		});
	});
});
