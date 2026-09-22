import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ValidationError } from "../../../src/services/errors";
import { parseDataImageUrl } from "../../../src/services/storage/parseDataImageUrl";
import {
	LocalPreviewStorage,
	getPreviewStorage,
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

	it("accepte image/jpg comme alias jpeg", () => {
		const payload = Buffer.from("x").toString("base64");
		const parsed = parseDataImageUrl(`data:image/jpg;base64,${payload}`);
		expect(parsed.mimeType).toBe("image/jpeg");
		expect(parsed.ext).toBe("jpg");
	});

	it("décode png et webp", () => {
		const payload = Buffer.from("img").toString("base64");
		expect(parseDataImageUrl(`data:image/png;base64,${payload}`)).toMatchObject({
			mimeType: "image/png",
			ext: "png",
		});
		expect(parseDataImageUrl(`data:image/webp;base64,${payload}`)).toMatchObject({
			mimeType: "image/webp",
			ext: "webp",
		});
	});

	it("refuse un format invalide", () => {
		expect(() => parseDataImageUrl("https://x.com/a.jpg")).toThrow(ValidationError);
	});

	it("refuse une image vide", () => {
		// padding seul → buffer vide après decode (trim n’enlève pas le `=`)
		expect(() => parseDataImageUrl("data:image/png;base64,=")).toThrow(/empty/);
	});

	it("refuse une image trop volumineuse", () => {
		const big = Buffer.alloc(600_001, 1).toString("base64");
		expect(() => parseDataImageUrl(`data:image/jpeg;base64,${big}`)).toThrow(/too large/);
	});
});

describe("LocalPreviewStorage", () => {
	let dir: string;
	const prevStorageDir = process.env.PREVIEW_STORAGE_DIR;
	const prevPublicBase = process.env.PREVIEW_PUBLIC_BASE_URL;

	beforeEach(async () => {
		dir = await mkdtemp(path.join(tmpdir(), "ocv-preview-"));
		resetPreviewStorageForTests();
	});

	afterEach(async () => {
		resetPreviewStorageForTests();
		if (prevStorageDir === undefined) {
			delete process.env.PREVIEW_STORAGE_DIR;
		} else {
			process.env.PREVIEW_STORAGE_DIR = prevStorageDir;
		}
		if (prevPublicBase === undefined) {
			delete process.env.PREVIEW_PUBLIC_BASE_URL;
		} else {
			process.env.PREVIEW_PUBLIC_BASE_URL = prevPublicBase;
		}
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

	it("refuse une clé invalide", async () => {
		const storage = new LocalPreviewStorage(dir, "/uploads/cv-previews");
		await expect(
			storage.put({
				key: "../escape.jpg",
				body: Buffer.from("x"),
				contentType: "image/jpeg",
			}),
		).rejects.toThrow(/Invalid preview storage key/);
	});

	it("deleteIfManaged supprime un fichier géré", async () => {
		const storage = new LocalPreviewStorage(dir, "/uploads/cv-previews");
		const { publicUrl } = await storage.put({
			key: "u1/del.jpg",
			body: Buffer.from("bye"),
			contentType: "image/jpeg",
		});
		await storage.deleteIfManaged(publicUrl);
		await expect(readFile(path.join(dir, "u1", "del.jpg"))).rejects.toThrow();
	});

	it("deleteIfManaged ignore URL étrangère, null et path traversal", async () => {
		const storage = new LocalPreviewStorage(dir, "/uploads/cv-previews");
		await expect(storage.deleteIfManaged(null)).resolves.toBeUndefined();
		await expect(storage.deleteIfManaged("https://cdn.example.com/x.jpg")).resolves.toBeUndefined();
		await expect(
			storage.deleteIfManaged("/uploads/cv-previews/../secret"),
		).resolves.toBeUndefined();
	});

	it("deleteIfManaged ignore un fichier déjà absent", async () => {
		const storage = new LocalPreviewStorage(dir, "/uploads/cv-previews");
		await expect(
			storage.deleteIfManaged("/uploads/cv-previews/missing/nope.jpg"),
		).resolves.toBeUndefined();
	});

	it("resolveLocalRoot honore PREVIEW_STORAGE_DIR", async () => {
		process.env.PREVIEW_STORAGE_DIR = dir;
		process.env.PREVIEW_PUBLIC_BASE_URL = "/custom-previews";
		resetPreviewStorageForTests();
		const storage = getPreviewStorage() as LocalPreviewStorage;
		const result = await storage.put({
			key: "env/test.png",
			body: Buffer.from("png"),
			contentType: "image/png",
		});
		expect(result.publicUrl).toBe("/custom-previews/env/test.png");
		const disk = await readFile(path.join(dir, "env", "test.png"));
		expect(disk.toString()).toBe("png");
	});
});
