import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { PreviewPutInput, PreviewStorage } from "./previewStorage";

const KEY_PREFIX = "cv-previews";

export type R2PreviewStorageConfig = {
	accessKeyId: string;
	secretAccessKey: string;
	endpoint: string;
	bucket: string;
	/** Base publique des objets (custom domain ou r2.dev), sans slash final */
	publicUrl: string;
};

export function readR2PreviewConfigFromEnv(): R2PreviewStorageConfig | null {
	const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
	const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
	const endpoint = process.env.R2_ENDPOINT?.trim();
	const bucket = process.env.R2_BUCKET_NAME?.trim();
	const publicUrl = process.env.R2_PUBLIC_URL?.trim()?.replace(/\/$/, "");

	if (!accessKeyId || !secretAccessKey || !endpoint || !bucket || !publicUrl) {
		return null;
	}

	return { accessKeyId, secretAccessKey, endpoint, bucket, publicUrl };
}

function sanitizeKey(key: string): string {
	const cleaned = key.replace(/\\/g, "/").replace(/^\/+/, "");
	if (!cleaned || cleaned.includes("..")) {
		throw new Error(`Invalid preview storage key: ${key}`);
	}
	return cleaned;
}

function toObjectKey(relativeKey: string): string {
	return `${KEY_PREFIX}/${sanitizeKey(relativeKey)}`;
}

/**
 * Cloudflare R2 via API S3-compatible.
 * Nécessite un accès public (ou custom domain) sur le bucket → R2_PUBLIC_URL.
 */
export class R2PreviewStorage implements PreviewStorage {
	private readonly client: S3Client;

	constructor(
		private readonly config: R2PreviewStorageConfig,
		client?: S3Client,
	) {
		this.client =
			client ??
			new S3Client({
				region: "auto",
				endpoint: config.endpoint,
				credentials: {
					accessKeyId: config.accessKeyId,
					secretAccessKey: config.secretAccessKey,
				},
			});
	}

	async put(input: PreviewPutInput): Promise<{ publicUrl: string }> {
		const objectKey = toObjectKey(input.key);
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.config.bucket,
				Key: objectKey,
				Body: input.body,
				ContentType: input.contentType,
				CacheControl: "public, max-age=0, must-revalidate",
			}),
		);
		// Même clé objet → URL stable ; le ?v= invalide caches navigateur / next/image
		return {
			publicUrl: `${this.config.publicUrl}/${objectKey}?v=${Date.now()}`,
		};
	}

	async deleteIfManaged(publicUrl: string | null | undefined): Promise<void> {
		const prefix = `${this.config.publicUrl}/`;
		if (!publicUrl?.startsWith(prefix)) return;
		const objectKey = publicUrl.slice(prefix.length).split("?")[0] ?? "";
		if (!objectKey || objectKey.includes("..")) return;
		try {
			await this.client.send(
				new DeleteObjectCommand({
					Bucket: this.config.bucket,
					Key: objectKey,
				}),
			);
		} catch {
			// objet déjà absent / droits
		}
	}
}
