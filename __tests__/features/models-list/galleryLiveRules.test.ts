import { describe, expect, it } from "vitest";
import {
	GALLERY_MODIFICATIONS_MAX,
	isGalleryCardLive,
	isGalleryModificationsLocked,
	shouldDeferGalleryListSwap,
	shouldProgressGalleryLive,
} from "@/features/models-list/galleryLiveRules";

describe("isGalleryModificationsLocked", () => {
	it("autorise jusqu’à la limite incluse", () => {
		expect(isGalleryModificationsLocked(0)).toBe(false);
		expect(isGalleryModificationsLocked(GALLERY_MODIFICATIONS_MAX)).toBe(false);
	});

	it("verrouille au-delà de la limite", () => {
		expect(isGalleryModificationsLocked(GALLERY_MODIFICATIONS_MAX + 1)).toBe(true);
	});
});

describe("isGalleryCardLive", () => {
	it("reste en PNG tant que rien n’est monté", () => {
		expect(isGalleryCardLive(0, 0)).toBe(false);
	});

	it("garde le live déjà monté (indépendamment du panneau)", () => {
		expect(isGalleryCardLive(0, 2)).toBe(true);
		expect(isGalleryCardLive(1, 2)).toBe(true);
		expect(isGalleryCardLive(2, 2)).toBe(false);
	});
});

describe("shouldProgressGalleryLive", () => {
	it("ne progresse pas si la session n’est pas armée", () => {
		expect(shouldProgressGalleryLive(false, 0, 9)).toBe(false);
	});

	it("progresse tant qu’il reste des cartes à monter", () => {
		expect(shouldProgressGalleryLive(true, 0, 9)).toBe(true);
		expect(shouldProgressGalleryLive(true, 8, 9)).toBe(true);
		expect(shouldProgressGalleryLive(true, 9, 9)).toBe(false);
	});
});

describe("shouldDeferGalleryListSwap", () => {
	it("ne diffère pas sans mini-CV montés", () => {
		expect(shouldDeferGalleryListSwap(0)).toBe(false);
	});

	it("diffère dès qu’au moins un mini-CV est monté", () => {
		expect(shouldDeferGalleryListSwap(1)).toBe(true);
	});
});
