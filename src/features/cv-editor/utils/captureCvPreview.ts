import { toJpeg } from "html-to-image";

const CV_SIGNATURE_SELECTOR = "[data-cv-signature]";

function setSignaturePreviewIgnore(ignore: boolean) {
	document.querySelectorAll(CV_SIGNATURE_SELECTOR).forEach((node) => {
		if (!(node instanceof HTMLElement)) return;
		if (ignore) node.dataset.previewIgnore = "true";
		else delete node.dataset.previewIgnore;
	});
}

export async function captureCvPreview(options?: {
	/** Exclut CvSignature de la capture via data-preview-ignore (pas de flash UI) */
	excludeSignature?: boolean;
}): Promise<string | null> {
	const el = document.querySelector(".cv-page-document");
	if (!(el instanceof HTMLElement)) return null;

	const excludeSignature = options?.excludeSignature === true;
	if (excludeSignature) setSignaturePreviewIgnore(true);

	try {
		return await toJpeg(el, {
			quality: 0.72,
			pixelRatio: 0.45, // ~940px → ~420px
			backgroundColor: "#ffffff",
			filter: (node) => !(node instanceof HTMLElement && node.dataset.previewIgnore === "true"),
		});
	} finally {
		if (excludeSignature) setSignaturePreviewIgnore(false);
	}
}

/** Double capture pour la modal download (avec / sans logo), sans flash. */
export async function captureDownloadPreviews(): Promise<{
	withLogo: string | null;
	withoutLogo: string | null;
}> {
	const withLogo = await captureCvPreview();
	const withoutLogo = await captureCvPreview({ excludeSignature: true });
	return { withLogo, withoutLogo };
}
