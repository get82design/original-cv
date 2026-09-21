import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	R2PreviewStorage,
	readR2PreviewConfigFromEnv,
} from "./r2PreviewStorage";

/**
 * Stockage des previews CV.
 * - Si R2_* + R2_PUBLIC_URL sont configurés → Cloudflare R2 (S3-compatible).
 * - Sinon → fichiers locaux sous public/uploads (dev / mono-serveur).
 */
export type PreviewPutInput = {
	/** chemin relatif safe, ex. userId/cvId-with.jpg */
	key: string;
	body: Buffer;
	contentType: string;
};

export type PreviewStorage = {
	put(input: PreviewPutInput): Promise<{ publicUrl: string }>;
	/** Supprime si l’URL appartient à ce stockage (sinon no-op). */
	deleteIfManaged(publicUrl: string | null | undefined): Promise<void>;
};

function resolveLocalRoot(): string {
	if (process.env.PREVIEW_STORAGE_DIR?.trim()) {
		return path.resolve(process.env.PREVIEW_STORAGE_DIR.trim());
	}
	return path.join(process.cwd(), "public", "uploads", "cv-previews");
}

function resolvePublicBase(): string {
	const base =
		process.env.PREVIEW_PUBLIC_BASE_URL?.trim() ||
		"/uploads/cv-previews";
	return base.replace(/\/$/, "");
}

export class LocalPreviewStorage implements PreviewStorage {
	constructor(
		private readonly rootDir = resolveLocalRoot(),
		private readonly publicBase = resolvePublicBase(),
	) {}

	async put(input: PreviewPutInput): Promise<{ publicUrl: string }> {
		const key = sanitizeKey(input.key);
		const fullPath = path.join(this.rootDir, key);
		await mkdir(path.dirname(fullPath), { recursive: true });
		await writeFile(fullPath, input.body);
		return { publicUrl: `${this.publicBase}/${key.replace(/\\/g, "/")}` };
	}

	async deleteIfManaged(
		publicUrl: string | null | undefined,
	): Promise<void> {
		if (!publicUrl?.startsWith(`${this.publicBase}/`)) return;
		const key = publicUrl.slice(this.publicBase.length + 1);
		if (!key || key.includes("..")) return;
		const fullPath = path.join(this.rootDir, key);
		try {
			await unlink(fullPath);
		} catch {
			// fichier déjà absent
		}
	}
}

function sanitizeKey(key: string): string {
	const cleaned = key.replace(/\\/g, "/").replace(/^\/+/, "");
	if (!cleaned || cleaned.includes("..") || path.isAbsolute(cleaned)) {
		throw new Error(`Invalid preview storage key: ${key}`);
	}
	return cleaned;
}

let singleton: PreviewStorage | null = null;

export function getPreviewStorage(): PreviewStorage {
	if (!singleton) {
		const isTest =
			process.env.VITEST === "true" || process.env.NODE_ENV === "test";
		if (isTest) {
			singleton = new LocalPreviewStorage();
		} else {
			const r2 = readR2PreviewConfigFromEnv();
			singleton = r2
				? new R2PreviewStorage(r2)
				: new LocalPreviewStorage();
		}
	}
	return singleton;
}

/** Tests : réinitialise le singleton (nouveau root / env). */
export function resetPreviewStorageForTests(): void {
	singleton = null;
}
