import { CreateCvProvider } from "@/features/cv-editor/component/context/CreateCvContext";
import { ModelAndColorProvider } from "@/features/cv-editor/component/context/ModelAndColorContext";
import ModelList from "@/features/models-list/ModelList";
import Head from "next/head";

const SITE_NAME = "OriginalCV";
const PAGE_TITLE = "Modèles de CV — OriginalCV";
const PAGE_DESCRIPTION =
	"Parcourez les modèles de CV OriginalCV : 1 ou 2 colonnes, classiques ou premium. Choisissez un design et créez votre CV en ligne.";

export default function Modeles() {
	const siteUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";
	const pageUrl = siteUrl ? `${siteUrl}/modeles` : "";

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: PAGE_TITLE,
		description: PAGE_DESCRIPTION,
		inLanguage: "fr",
		isPartOf: {
			"@type": "WebSite",
			name: SITE_NAME,
			...(siteUrl ? { url: `${siteUrl}/` } : {}),
		},
		...(pageUrl ? { url: pageUrl } : {}),
	};

	return (
		<>
			<Head>
				<title>{PAGE_TITLE}</title>
				<meta name="description" content={PAGE_DESCRIPTION} />
				<meta property="og:type" content="website" />
				<meta property="og:locale" content="fr_FR" />
				<meta property="og:site_name" content={SITE_NAME} />
				<meta property="og:title" content={PAGE_TITLE} />
				<meta property="og:description" content={PAGE_DESCRIPTION} />
				{pageUrl ? <meta property="og:url" content={pageUrl} /> : null}
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:title" content={PAGE_TITLE} />
				<meta name="twitter:description" content={PAGE_DESCRIPTION} />
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD SEO, données app contrôlées
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</Head>
			<ModelAndColorProvider>
				<CreateCvProvider>
					<ModelList />
				</CreateCvProvider>
			</ModelAndColorProvider>
		</>
	);
}
