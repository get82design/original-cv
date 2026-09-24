import { describe, expect, it } from "vitest";
import {
	photoStyleClassName,
	resolvePhotoSrc,
} from "../../../src/components/photo/photoUtils";

describe("photoUtils", () => {
	it("mappe stylePhoto vers des classes border-radius", () => {
		expect(photoStyleClassName("circle")).toBe("rounded-full");
		expect(photoStyleClassName("rounded")).toBe("rounded-2xl");
		expect(photoStyleClassName("flat")).toBe("rounded");
		expect(photoStyleClassName(null)).toBe("rounded");
	});

	it("résout le fallback quand la photo est vide", () => {
		expect(resolvePhotoSrc(null)).toBe("/assets/img/User-avatar.svg.png");
		expect(resolvePhotoSrc("")).toBe("/assets/img/User-avatar.svg.png");
		expect(resolvePhotoSrc("data:image/jpeg;base64,abc")).toBe(
			"data:image/jpeg;base64,abc",
		);
	});
});
