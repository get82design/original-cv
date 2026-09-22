import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pdfPagesToImages } from "../src/services/ai/pdfToImages";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
	const inputPath = process.argv[2];
	if (!inputPath) {
		console.error("Usage: npm run pdf:to-images -- <chemin-vers.pdf>");
		process.exitCode = 1;
		return;
	}

	const abs = resolve(inputPath);
	console.log("Reading", abs);
	const buffer = await readFile(abs);
	const pages = await pdfPagesToImages(buffer, { maxPages: 3, scale: 2 });

	const outDir = join(__dirname, "../.tmp/pdf-pages");
	await mkdir(outDir, { recursive: true });

	for (const page of pages) {
		const out = join(outDir, `page-${page.pageNumber}.png`);
		await writeFile(out, Buffer.from(page.base64, "base64"));
		console.log(
			`page ${page.pageNumber}: ${page.mimeType}, base64 length=${page.base64.length} → ${out}`,
		);
	}

	console.log(`Done — ${pages.length} page(s)`);
}

main().catch((err) => {
	console.error("pdf:to-images failed:", err instanceof Error ? err.message : err);
	process.exitCode = 1;
});
