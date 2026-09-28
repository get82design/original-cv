import type { GetServerSideProps } from "next";
import {
	buildSitemapXml,
	getSiteUrl,
	isSearchIndexingEnabled,
	type SitemapUrlEntry,
} from "@/services/seo/searchIndexing";
import { prisma } from "../lib/prisma";

/**
 * `/sitemap.xml` — URLs marketing seulement si indexation ON ; sinon urlset vide.
 */
function SitemapXml() {
	return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	const siteUrl = getSiteUrl();
	const entries: SitemapUrlEntry[] = [];

	if (isSearchIndexingEnabled() && siteUrl) {
		const staticPaths = [
			"/",
			"/modeles",
			"/cgu",
			"/politique-de-confidentialite",
			"/mentions-legales",
		];
		for (const path of staticPaths) {
			entries.push({ loc: `${siteUrl}${path === "/" ? "/" : path}` });
		}

		const templates = await prisma.cVTemplate.findMany({
			where: { isActive: true },
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
			select: { slug: true },
		});

		for (const t of templates) {
			entries.push({ loc: `${siteUrl}/modeles/${t.slug}` });
		}
	}

	const body = buildSitemapXml(entries);
	res.setHeader("Content-Type", "application/xml; charset=utf-8");
	res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600");
	res.write(body);
	res.end();
	return { props: {} };
};

export default SitemapXml;
