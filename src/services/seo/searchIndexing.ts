/**
 * Contrôle d’indexation moteurs (Google, etc.).
 * Défaut : fermé — ouvrir avec SEARCH_INDEXING_ENABLED=true (feu vert prod).
 */

export function getSiteUrl(): string {
	return process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";
}

/** `true` uniquement si SEARCH_INDEXING_ENABLED=true|1|yes (insensible à la casse). */
export function isSearchIndexingEnabled(): boolean {
	const raw = process.env.SEARCH_INDEXING_ENABLED?.trim().toLowerCase();
	return raw === "true" || raw === "1" || raw === "yes";
}

/** Préfixes / chemins jamais indexables (auth, app, admin). */
export const PRIVATE_PATH_PREFIXES = [
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/profile",
	"/cv",
	"/admin",
	"/api",
] as const;

export function isPrivatePath(pathname: string): boolean {
	const path = pathname.split("?")[0] ?? pathname;
	return PRIVATE_PATH_PREFIXES.some(
		(prefix) => path === prefix || path.startsWith(`${prefix}/`),
	);
}

/**
 * Contenu `<meta name="robots">`.
 * - pages privées : toujours noindex
 * - pages publiques : index seulement si le flag est ON
 */
export function robotsMetaContent(pathname: string): string {
	if (isPrivatePath(pathname)) {
		return "noindex, nofollow";
	}
	return isSearchIndexingEnabled() ? "index, follow" : "noindex, nofollow";
}

/** Corps `robots.txt` (texte brut). */
export function buildRobotsTxt(siteUrl: string, indexingEnabled: boolean): string {
	const lines: string[] = ["User-agent: *"];

	if (!indexingEnabled) {
		lines.push("Disallow: /");
	} else {
		lines.push("Allow: /");
		for (const prefix of PRIVATE_PATH_PREFIXES) {
			if (prefix === "/api") {
				lines.push("Disallow: /api/");
			} else {
				lines.push(`Disallow: ${prefix}`);
			}
		}
	}

	if (siteUrl) {
		lines.push("");
		lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
	}

	return `${lines.join("\n")}\n`;
}

export type SitemapUrlEntry = {
	loc: string;
	lastmod?: string;
};

/** XML sitemap ; vide (urlset sans url) si indexation OFF. */
export function buildSitemapXml(entries: SitemapUrlEntry[]): string {
	const body = entries
		.map((e) => {
			const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : "";
			return `  <url>\n    <loc>${escapeXml(e.loc)}</loc>${lastmod}\n  </url>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}
