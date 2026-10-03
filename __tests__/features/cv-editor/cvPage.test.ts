import { describe, expect, it } from "vitest";
import {
	cvPageContentHeight,
	packSectionsIntoPages,
	mergeTwoColumnPages,
	twoColumnPageKey,
	CV_PAGE_HEIGHT,
	CV_PAGE_PAD_PX,
	CV_SIGNATURE_RESERVE_PX,
} from "@/features/cv-editor/utils/cvPage";

describe("cvPageContentHeight", () => {
	it("soustrait padding + signature", () => {
		expect(cvPageContentHeight("md")).toBe(
			CV_PAGE_HEIGHT - 2 * CV_PAGE_PAD_PX.md - CV_SIGNATURE_RESERVE_PX,
		);
	});
});

describe("packSectionsIntoPages", () => {
	it("met tout sur une page si ça tient", () => {
		const heights = new Map([
			["a", 100],
			["b", 100],
		]);
		const pages = packSectionsIntoPages({
			sectionIds: ["a", "b"],
			heights,
			headerHeight: 200,
			contentHeight: 1000,
		});
		expect(pages).toEqual([["a", "b"]]);
	});

	it("passe à la page 2 sans recompter le header", () => {
		const heights = new Map([
			["a", 400],
			["b", 400],
			["c", 400],
		]);
		// page1: header 200 + a 400 = 600 ; +b = 1000 > 900 → b page2 ; c page2
		const pages = packSectionsIntoPages({
			sectionIds: ["a", "b", "c"],
			heights,
			headerHeight: 200,
			contentHeight: 900,
		});
		expect(pages).toEqual([["a"], ["b", "c"]]);
	});

	it("une section trop haute part seule", () => {
		const heights = new Map([["huge", 2000]]);
		const pages = packSectionsIntoPages({
			sectionIds: ["huge"],
			heights,
			headerHeight: 100,
			contentHeight: 800,
		});
		expect(pages).toEqual([["huge"]]);
	});

	it("retourne une page vide sans sections", () => {
		expect(
			packSectionsIntoPages({
				sectionIds: [],
				heights: new Map(),
				headerHeight: 100,
				contentHeight: 800,
			}),
		).toEqual([[]]);
	});
});

describe("mergeTwoColumnPages", () => {
	it("aligne sidebar et main sur le max de pages", () => {
		expect(
			mergeTwoColumnPages(
				[["s1"], ["s2"]],
				[["m1", "m2"]],
			),
		).toEqual([
			{ sidebarIds: ["s1"], mainIds: ["m1", "m2"] },
			{ sidebarIds: ["s2"], mainIds: [] },
		]);
	});

	it("garantit au moins une page", () => {
		expect(mergeTwoColumnPages([[]], [[]])).toEqual([
			{ sidebarIds: [], mainIds: [] },
		]);
	});
});

describe("twoColumnPageKey", () => {
	it("dérive une clé du contenu des colonnes", () => {
		expect(
			twoColumnPageKey({ sidebarIds: ["s1"], mainIds: ["m1", "m2"] }),
		).toBe("2col-s1__m1+m2");
	});

	it("reste stable pour une page vide", () => {
		expect(twoColumnPageKey({ sidebarIds: [], mainIds: [] })).toBe("2col-____");
	});
});
