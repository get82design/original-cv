import { TemplateCatalogBadges } from "@/components/badge/TemplateCatalogBadges";
import { buildTemplateMarketingCopy } from "@/features/models-list/templateMarketingCopy";
import type { PublicTemplateDetail } from "@/services/cv/cvTemplateService";
import type { TemplateNavItem } from "@/services/cv/templateNeighbors";
import { templateStyleLabel } from "@/utils/templateStyleCategory";
import Image from "next/image";
import Link from "next/link";
import { Button } from "primereact/button";

type TemplateDetailPageProps = {
	template: PublicTemplateDetail;
	prev: TemplateNavItem | null;
	next: TemplateNavItem | null;
};

/**
 * Fiche marketing légère d’un modèle (SSR) — texte + grande vignette + CTA + nav.
 */
export const TemplateDetailPage = ({ template, prev, next }: TemplateDetailPageProps) => {
	const { blurb } = buildTemplateMarketingCopy(template);
	const colsLabel = template.columns > 1 ? "2 colonnes" : "1 colonne";
	const useHref = `/cv/0?template=${encodeURIComponent(template.name)}`;

	return (
		<main className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 pb-20 text-zinc-900 dark:text-zinc-100">
			<p className="m-0 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
				<Link href="/modeles" className="text-primary hover:underline dark:text-primary-dark">
					← Tous les modèles
				</Link>
			</p>

			<div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10">
				<div className="relative mx-auto w-full max-w-[28rem] sm:max-w-[30rem] aspect-[1/1.414] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
					<Image
						src={`/assets/img/${template.name}.png`}
						alt={`Modèle de CV ${template.name} — ${colsLabel}`}
						fill
						priority
						sizes="(max-width: 640px) 90vw, 30rem"
						className="object-cover object-top"
					/>
					<div className="absolute top-3 right-3 z-10">
						<TemplateCatalogBadges
							isFeatured={template.isFeatured}
							isPremium={template.isPremium}
							size="md"
							className="opacity-100!"
						/>
					</div>
				</div>

				<div className="flex flex-col gap-4 lg:pt-2">
					<p className="m-0 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Modèle de CV · {templateStyleLabel(template.styleCategory)} · {colsLabel}
						{template.isPremium ? " · Premium" : " · Gratuit"}
					</p>
					<h1 className="m-0 text-3xl font-bold tracking-tight sm:text-4xl">{template.name}</h1>
					<p className="m-0 text-base leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-lg">
						{blurb}
					</p>

					<div className="mt-2 flex flex-wrap gap-3">
						<Link href={useHref}>
							<Button type="button" label="Utiliser ce modèle" />
						</Link>
						<Link href="/modeles">
							<Button type="button" label="Voir le catalogue" outlined />
						</Link>
					</div>
				</div>
			</div>

			<nav
				aria-label="Navigation entre modèles"
				className="absolute bottom-4 right-4 z-10 flex items-center gap-2 sm:bottom-6 sm:right-6"
			>
				{prev ? (
					<Link href={`/modeles/${prev.slug}`} aria-label={`Modèle précédent : ${prev.name}`}>
						<Button
							type="button"
							icon="pi pi-chevron-left"
							rounded
							outlined
							raised
							className="shadow-md"
							tooltip={prev.name}
							tooltipOptions={{ position: "top" }}
						/>
					</Link>
				) : (
					<Button
						type="button"
						icon="pi pi-chevron-left"
						rounded
						outlined
						disabled
						aria-label="Pas de modèle précédent"
						className="opacity-40 shadow-md"
					/>
				)}
				{next ? (
					<Link href={`/modeles/${next.slug}`} aria-label={`Modèle suivant : ${next.name}`}>
						<Button
							type="button"
							icon="pi pi-chevron-right"
							rounded
							outlined
							raised
							className="shadow-md"
							tooltip={next.name}
							tooltipOptions={{ position: "top" }}
						/>
					</Link>
				) : (
					<Button
						type="button"
						icon="pi pi-chevron-right"
						rounded
						outlined
						disabled
						aria-label="Pas de modèle suivant"
						className="opacity-40 shadow-md"
					/>
				)}
			</nav>
		</main>
	);
};
