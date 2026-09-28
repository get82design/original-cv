import type { GetServerSideProps } from "next";
import {
	buildRobotsTxt,
	getSiteUrl,
	isSearchIndexingEnabled,
} from "@/services/seo/searchIndexing";

/**
 * `/robots.txt` — Disallow: / tant que SEARCH_INDEXING_ENABLED n’est pas true.
 */
function RobotsTxt() {
	return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	const body = buildRobotsTxt(getSiteUrl(), isSearchIndexingEnabled());
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600");
	res.write(body);
	res.end();
	return { props: {} };
};

export default RobotsTxt;
