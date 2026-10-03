import { describe, expect, it } from "vitest";
import { columnPaddingForHeaderPlacement } from "@/features/cv-editor/utils/utilsCv/marge";

describe("columnPaddingForHeaderPlacement", () => {
	it("retire le padding-top quand headerPlacement est top", () => {
		expect(columnPaddingForHeaderPlacement("p-8", "top")).toBe("px-8 pb-8 pt-0");
		expect(columnPaddingForHeaderPlacement("p-12", "top")).toBe("px-12 pb-12 pt-0");
		expect(columnPaddingForHeaderPlacement("p-16", "top")).toBe("px-16 pb-16 pt-0");
	});

	it("conserve le padding complet pour sidebar et split", () => {
		expect(columnPaddingForHeaderPlacement("p-12", "sidebar")).toBe("p-12");
		expect(columnPaddingForHeaderPlacement("p-12", "split")).toBe("p-12");
	});
});
