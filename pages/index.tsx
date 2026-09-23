import Head from "next/head";
import { HomeComponent } from "../src/features/home/HomeCompo";

const SITE_NAME = "OriginalCV";
const PAGE_TITLE = "OriginalCV — CV professionnel et modulable en ligne";
const PAGE_DESCRIPTION =
	"Choisissez un modèle pro, adaptez couleurs et mise en page, et créez un CV clair et soigné avec OriginalCV.";

export default function Home() {
	const siteUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: SITE_NAME,
		description: PAGE_DESCRIPTION,
		applicationCategory: "BusinessApplication",
		operatingSystem: "Any",
		browserRequirements: "Requires JavaScript",
		inLanguage: "fr",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "EUR",
		},
		...(siteUrl
			? {
					url: `${siteUrl}/`,
				}
			: {}),
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
				{siteUrl ? <meta property="og:url" content={`${siteUrl}/`} /> : null}
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:title" content={PAGE_TITLE} />
				<meta name="twitter:description" content={PAGE_DESCRIPTION} />
				<script
					type="application/ld+json"
					 // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD SEO, données app contrôlées
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</Head>
			<HomeComponent />
		</>
	);
}
