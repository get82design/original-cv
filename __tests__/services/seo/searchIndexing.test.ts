import { describe, expect, it, afterEach } from "vitest";
import {
	buildRobotsTxt,
	buildSitemapXml,
	isPrivatePath,
	isSearchIndexingEnabled,
	robotsMetaContent,
} from "../../../src/services/seo/searchIndexing";

describe("searchIndexing", () => {
	const prev = process.env.SEARCH_INDEXING_ENABLED;

	afterEach(() => {
		if (prev === undefined) {
			delete process.env.SEARCH_INDEXING_ENABLED;
		} else {
			process.env.SEARCH_INDEXING_ENABLED = prev;
		}
	});

	it("isSearchIndexingEnabled is false by default", () => {
		delete process.env.SEARCH_INDEXING_ENABLED;
		expect(isSearchIndexingEnabled()).toBe(false);
	});

	it("isSearchIndexingEnabled accepts true/1/yes", () => {
		process.env.SEARCH_INDEXING_ENABLED = "true";
		expect(isSearchIndexingEnabled()).toBe(true);
		process.env.SEARCH_INDEXING_ENABLED = "1";
		expect(isSearchIndexingEnabled()).toBe(true);
		process.env.SEARCH_INDEXING_ENABLED = "YES";
		expect(isSearchIndexingEnabled()).toBe(true);
	});

	it("marks auth and app paths as private", () => {
		expect(isPrivatePath("/login")).toBe(true);
		expect(isPrivatePath("/cv/abc")).toBe(true);
		expect(isPrivatePath("/admin/users")).toBe(true);
		expect(isPrivatePath("/modeles")).toBe(false);
		expect(isPrivatePath("/modeles/[slug]")).toBe(false);
		expect(isPrivatePath("/")).toBe(false);
	});

	it("robotsMetaContent noindexes private always", () => {
		process.env.SEARCH_INDEXING_ENABLED = "true";
		expect(robotsMetaContent("/profile")).toBe("noindex, nofollow");
	});

	it("robotsMetaContent noindexes public when flag off", () => {
		delete process.env.SEARCH_INDEXING_ENABLED;
		expect(robotsMetaContent("/")).toBe("noindex, nofollow");
		expect(robotsMetaContent("/modeles")).toBe("noindex, nofollow");
	});

	it("robotsMetaContent indexes public when flag on", () => {
		process.env.SEARCH_INDEXING_ENABLED = "true";
		expect(robotsMetaContent("/")).toBe("index, follow");
		expect(robotsMetaContent("/modeles")).toBe("index, follow");
	});

	it("buildRobotsTxt disallows all when indexing off", () => {
		const txt = buildRobotsTxt("https://example.com", false);
		expect(txt).toContain("Disallow: /");
		expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
	});

	it("buildRobotsTxt allows site and disallows private when on", () => {
		const txt = buildRobotsTxt("https://example.com", true);
		expect(txt).toContain("Allow: /");
		expect(txt).toContain("Disallow: /login");
		expect(txt).toContain("Disallow: /cv");
		expect(txt).toContain("Disallow: /admin");
		expect(txt).not.toMatch(/Disallow: \/\n/);
	});

	it("buildSitemapXml renders entries", () => {
		const xml = buildSitemapXml([
			{ loc: "https://example.com/" },
			{ loc: "https://example.com/modeles/berlin" },
		]);
		expect(xml).toContain("<loc>https://example.com/</loc>");
		expect(xml).toContain("<loc>https://example.com/modeles/berlin</loc>");
	});

	it("buildSitemapXml can be empty urlset", () => {
		const xml = buildSitemapXml([]);
		expect(xml).toContain("<urlset");
		expect(xml).not.toContain("<url>");
	});
});
