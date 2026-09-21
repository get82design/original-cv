import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ValidationError } from "../../../src/services/errors";
import { parseDataImageUrl } from "../../../src/services/storage/parseDataImageUrl";
import {
	LocalPreviewStorage,
	resetPreviewStorageForTests,
} from "../../../src/services/storage/previewStorage";

describe("parseDataImageUrl", () => {
	it("décode un jpeg base64", () => {
		const payload = Buffer.from("hello").toString("base64");
		const parsed = parseDataImageUrl(`data:image/jpeg;base64,${payload}`);
		expect(parsed.mimeType).toBe("image/jpeg");
		expect(parsed.ext).toBe("jpg");
		expect(parsed.buffer.toString()).toBe("hello");
	});

	it("refuse un format invalide", () => {
		expect(() => parseDataImageUrl("https://x.com/a.jpg")).toThrow(
			ValidationError,
		);
	});
});

describe("LocalPreviewStorage", () => {
	let dir: string;

	beforeEach(async () => {
		dir = await mkdtemp(path.join(tmpdir(), "ocv-preview-"));
		resetPreviewStorageForTests();
	});

	afterEach(async () => {
		resetPreviewStorageForTests();
		await rm(dir, { recursive: true, force: true });
	});

	it("écrit un fichier et renvoie une URL publique", async () => {
		const storage = new LocalPreviewStorage(dir, "/uploads/cv-previews");
		const result = await storage.put({
			key: "u1/cv1-with.jpg",
			body: Buffer.from("img"),
			contentType: "image/jpeg",
		});
		expect(result.publicUrl).toBe("/uploads/cv-previews/u1/cv1-with.jpg");
		const disk = await readFile(path.join(dir, "u1", "cv1-with.jpg"));
		expect(disk.toString()).toBe("img");
	});
});
