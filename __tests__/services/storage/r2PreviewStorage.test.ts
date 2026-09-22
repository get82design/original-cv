import { afterEach, describe, expect, it, vi } from "vitest";
import {
	R2PreviewStorage,
	readR2PreviewConfigFromEnv,
} from "../../../src/services/storage/r2PreviewStorage";
import {
	getPreviewStorage,
	LocalPreviewStorage,
	resetPreviewStorageForTests,
} from "../../../src/services/storage/previewStorage";

describe("readR2PreviewConfigFromEnv", () => {
	afterEach(() => {
		resetPreviewStorageForTests();
	});

	it("retourne null si une var manque", () => {
		const prev = { ...process.env };
		delete process.env.R2_ACCESS_KEY_ID;
		delete process.env.R2_SECRET_ACCESS_KEY;
		delete process.env.R2_ENDPOINT;
		delete process.env.R2_BUCKET_NAME;
		delete process.env.R2_PUBLIC_URL;
		expect(readR2PreviewConfigFromEnv()).toBeNull();
		process.env = prev;
	});

	it("lit la config complète", () => {
		const prev = { ...process.env };
		process.env.R2_ACCESS_KEY_ID = "ak";
		process.env.R2_SECRET_ACCESS_KEY = "sk";
		process.env.R2_ENDPOINT = "https://example.r2.cloudflarestorage.com";
		process.env.R2_BUCKET_NAME = "bucket";
		process.env.R2_PUBLIC_URL = "https://cdn.example.com/";
		expect(readR2PreviewConfigFromEnv()).toEqual({
			accessKeyId: "ak",
			secretAccessKey: "sk",
			endpoint: "https://example.r2.cloudflarestorage.com",
			bucket: "bucket",
			publicUrl: "https://cdn.example.com",
		});
		process.env = prev;
	});
});

describe("R2PreviewStorage", () => {
	const config = {
		accessKeyId: "ak",
		secretAccessKey: "sk",
		endpoint: "https://example.r2.cloudflarestorage.com",
		bucket: "my-bucket",
		publicUrl: "https://cdn.example.com",
	};

	it("put envoie PutObject et renvoie l’URL publique", async () => {
		const send = vi.fn().mockResolvedValue({});
		const storage = new R2PreviewStorage(config, { send } as never);

		const result = await storage.put({
			key: "u1/cv1-with.jpg",
			body: Buffer.from("img"),
			contentType: "image/jpeg",
		});

		expect(result.publicUrl).toBe(
			"https://cdn.example.com/cv-previews/u1/cv1-with.jpg",
		);
		expect(send).toHaveBeenCalledOnce();
		const cmd = send.mock.calls[0]?.[0];
		expect(cmd.input).toMatchObject({
			Bucket: "my-bucket",
			Key: "cv-previews/u1/cv1-with.jpg",
			ContentType: "image/jpeg",
		});
	});

	it("refuse une clé invalide au put", async () => {
		const send = vi.fn();
		const storage = new R2PreviewStorage(config, { send } as never);
		await expect(
			storage.put({
				key: "../evil.jpg",
				body: Buffer.from("x"),
				contentType: "image/jpeg",
			}),
		).rejects.toThrow(/Invalid preview storage key/);
		expect(send).not.toHaveBeenCalled();
	});

	it("deleteIfManaged envoie DeleteObject pour une URL gérée", async () => {
		const send = vi.fn().mockResolvedValue({});
		const storage = new R2PreviewStorage(config, { send } as never);

		await storage.deleteIfManaged(
			"https://cdn.example.com/cv-previews/u1/cv1-with.jpg",
		);

		expect(send).toHaveBeenCalledOnce();
		expect(send.mock.calls[0]?.[0].input).toMatchObject({
			Bucket: "my-bucket",
			Key: "cv-previews/u1/cv1-with.jpg",
		});
	});

	it("deleteIfManaged ignore URL étrangère, null et traversal", async () => {
		const send = vi.fn();
		const storage = new R2PreviewStorage(config, { send } as never);

		await storage.deleteIfManaged(null);
		await storage.deleteIfManaged("https://other.cdn/x.jpg");
		await storage.deleteIfManaged("https://cdn.example.com/../secret");
		expect(send).not.toHaveBeenCalled();
	});

	it("deleteIfManaged avale les erreurs S3", async () => {
		const send = vi.fn().mockRejectedValue(new Error("NoSuchKey"));
		const storage = new R2PreviewStorage(config, { send } as never);

		await expect(
			storage.deleteIfManaged(
				"https://cdn.example.com/cv-previews/gone.jpg",
			),
		).resolves.toBeUndefined();
	});
});

describe("getPreviewStorage", () => {
	afterEach(() => {
		resetPreviewStorageForTests();
	});

	it("utilise le local en environnement de test", () => {
		const prev = { ...process.env };
		delete process.env.R2_PUBLIC_URL;
		resetPreviewStorageForTests();
		expect(getPreviewStorage()).toBeInstanceOf(LocalPreviewStorage);
		process.env = prev;
		resetPreviewStorageForTests();
	});

	it("choisit R2 hors test quand la config est complète", () => {
		const prevVitest = process.env.VITEST;
		const prevNodeEnv = process.env.NODE_ENV;
		const prev = { ...process.env };

		process.env.VITEST = "";
		process.env.NODE_ENV = "production";
		process.env.R2_ACCESS_KEY_ID = "ak";
		process.env.R2_SECRET_ACCESS_KEY = "sk";
		process.env.R2_ENDPOINT = "https://example.r2.cloudflarestorage.com";
		process.env.R2_BUCKET_NAME = "bucket";
		process.env.R2_PUBLIC_URL = "https://cdn.example.com";
		resetPreviewStorageForTests();

		expect(getPreviewStorage()).toBeInstanceOf(R2PreviewStorage);

		process.env = prev;
		if (prevVitest !== undefined) process.env.VITEST = prevVitest;
		if (prevNodeEnv !== undefined) process.env.NODE_ENV = prevNodeEnv;
		resetPreviewStorageForTests();
	});
});
