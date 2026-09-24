import type { StylePhoto } from "@/services/schemas/cvTemplate.schema";

const FALLBACK_PHOTO = "/assets/img/User-avatar.svg.png";

export function photoStyleClassName(
	stylePhoto: StylePhoto | null | undefined,
): string {
	if (stylePhoto === "circle") return "rounded-full";
	if (stylePhoto === "rounded") return "rounded-2xl";
	return "rounded";
}

export function resolvePhotoSrc(photo: string | null | undefined): string {
	if (photo && photo.trim() !== "") return photo;
	return FALLBACK_PHOTO;
}

/** Lit un fichier image et le compresse en data URL JPEG (max côté ~512px). */
export function fileToPhotoDataUrl(
	file: File,
	options?: { maxSide?: number; quality?: number },
): Promise<string> {
	const maxSide = options?.maxSide ?? 512;
	const quality = options?.quality ?? 0.85;

	return new Promise((resolve, reject) => {
		if (!file.type.startsWith("image/")) {
			reject(new Error("Le fichier doit être une image."));
			return;
		}

		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Lecture de l'image impossible."));
		reader.onload = () => {
			const result = reader.result;
			if (typeof result !== "string") {
				reject(new Error("Format d'image invalide."));
				return;
			}

			const img = new Image();
			img.onerror = () => reject(new Error("Image illisible."));
			img.onload = () => {
				const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
				const width = Math.max(1, Math.round(img.width * scale));
				const height = Math.max(1, Math.round(img.height * scale));
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("Canvas indisponible."));
					return;
				}
				ctx.drawImage(img, 0, 0, width, height);
				resolve(canvas.toDataURL("image/jpeg", quality));
			};
			img.src = result;
		};
		reader.readAsDataURL(file);
	});
}
