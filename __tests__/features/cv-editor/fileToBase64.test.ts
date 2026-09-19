import { describe, expect, it } from "vitest";
import { fileToBase64 } from "../../../src/features/cv-editor/utils/fileToBase64";

describe("fileToBase64", () => {
	it("returns base64 without data: prefix", async () => {
		const file = new File([Uint8Array.from([1, 2, 3, 4])], "x.pdf", {
			type: "application/pdf",
		});
		const b64 = await fileToBase64(file);
		expect(b64).not.toContain("data:");
		expect(b64.length).toBeGreaterThan(0);
		expect(Buffer.from(b64, "base64").length).toBe(4);
	});
});
