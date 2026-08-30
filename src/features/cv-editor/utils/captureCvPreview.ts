import { toJpeg } from "html-to-image";
export async function captureCvPreview(): Promise<string | null> {
	const el = document.querySelector(".cv-page-document");
	if (!(el instanceof HTMLElement)) return null;
	return toJpeg(el, {
		quality: 0.72,
		pixelRatio: 0.45, // ~940px → ~420px
		backgroundColor: "#ffffff",
		filter: (node) =>
			!(node instanceof HTMLElement && node.dataset.previewIgnore === "true"),
	});
}
