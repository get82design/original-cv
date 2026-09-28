import { TemplateDetailPage } from "@/features/models-list/TemplateDetailPage";
import { buildTemplateMarketingCopy } from "@/features/models-list/templateMarketingCopy";
import { cvTemplateService } from "@/services/cv/cvTemplateService";
import type { TemplateNavItem } from "@/services/cv/templateNeighbors";
import { NotFoundError } from "@/services/errors";
import type { GetServerSideProps } from "next";
import Head from "next/head";

const SITE_NAME = "OriginalCV";

type Props = {
	template: {
		id: string;
		name: string;
		slug: string;
		isPremium: boolean;
		isFeatured: boolean;
		priceCents: number | null;
		priceCredits: number | null;
		columns: number;
	};
	prev: TemplateNavItem | null;
	next: TemplateNavItem | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const raw = ctx.params?.slug;
	const slug = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
	if (!slug) {
		return { notFound: true };
	}

	try {
		const { prev, next, ...template } = await cvTemplateService.findPublicDetailPage(slug);
		return { props: { template, prev, next } };
	} catch (err) {
		if (err instanceof NotFoundError) {
			return { notFound: true };
		}
		throw err;
	}
};

export default function ModelesSlugPage({ template, prev, next }: Props) {
	const siteUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";
	const pageUrl = siteUrl ? `${siteUrl}/modeles/${template.slug}` : "";
	const { title, description } = buildTemplateMarketingCopy(template);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: title,
		description,
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
				<title>{title}</title>
				<meta name="description" content={description} />
				<meta property="og:type" content="website" />
				<meta property="og:locale" content="fr_FR" />
				<meta property="og:site_name" content={SITE_NAME} />
				<meta property="og:title" content={title} />
				<meta property="og:description" content={description} />
				{pageUrl ? <meta property="og:url" content={pageUrl} /> : null}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={title} />
				<meta name="twitter:description" content={description} />
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD SEO, données app contrôlées
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</Head>
			<TemplateDetailPage template={template} prev={prev} next={next} />
		</>
	);
}
