import { describe, expect, it, vi } from "vitest";
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
	it("put envoie PutObject et renvoie l’URL publique", async () => {
		const send = vi.fn().mockResolvedValue({});
		const storage = new R2PreviewStorage(
			{
				accessKeyId: "ak",
				secretAccessKey: "sk",
				endpoint: "https://example.r2.cloudflarestorage.com",
				bucket: "my-bucket",
				publicUrl: "https://cdn.example.com",
			},
			{ send } as never,
		);

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
});

describe("getPreviewStorage", () => {
	it("utilise le local si R2 incomplete", () => {
		const prev = { ...process.env };
		delete process.env.R2_PUBLIC_URL;
		resetPreviewStorageForTests();
		expect(getPreviewStorage()).toBeInstanceOf(LocalPreviewStorage);
		process.env = prev;
		resetPreviewStorageForTests();
	});
});
