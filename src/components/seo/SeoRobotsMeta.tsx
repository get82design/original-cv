import Head from "next/head";
import { useRouter } from "next/router";
import { robotsMetaContent } from "@/services/seo/searchIndexing";

/**
 * Meta robots globale — privées toujours noindex ; publiques selon SEARCH_INDEXING_ENABLED.
 */
export const SeoRobotsMeta = () => {
	const router = useRouter();
	const content = robotsMetaContent(router.pathname);

	return (
		<Head>
			<meta name="robots" content={content} key="robots" />
		</Head>
	);
};
