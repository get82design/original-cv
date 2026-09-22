import { Button } from "primereact/button";
import { useMediaQuery } from "../../../utils/useWindowWidth";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppCard } from "../../components/card/AppCard";
import { TitleAppTwo } from "../../components/title/TitleAppTwo";
import { trpc } from "@utils/trpc";
import { DataView as PrimeDataView } from "primereact/dataview";
import type { TemplateCv } from "@utils/trpc.types";
import Image from "next/image";
import { SiteBrandLogo } from "@/components/brand/SiteBrandLogo";
import { TemplateCatalogBadges } from "@/components/badge/TemplateCatalogBadges";
import { useMemo } from "react";

function getTemplateColumns(template: TemplateCv): number {
	const layout = template.structure as { layout?: { columns?: number } } | null;
	return layout?.layout?.columns ?? 1;
}

function templateImageAlt(template: TemplateCv): string {
	const name = template.name.charAt(0).toUpperCase() + template.name.slice(1);
	const columns = getTemplateColumns(template);
	return `Modèle de CV ${name} — ${columns} colonne${columns > 1 ? "s" : ""}`;
}

export const HomeComponent = () => {
	const breakpoint = useMediaQuery("(min-width: 1024px)");
	const isSm = useMediaQuery("(min-width: 640px)");
	const { data: session, status } = useSession();
	const { data: templates } = trpc.cvTemplate.findAll.useQuery();
	const featured = useMemo(() => {
		if (!templates?.length) return [];
		const starred = templates.filter((t) => t.isFeatured);
		const rest = templates.filter((t) => !t.isFeatured);
		return [...starred, ...rest].slice(0, 8);
	}, [templates]);

	const gridItem = (template: TemplateCv) => {
		return (
			<div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg" key={template.id}>
				<div className="relative overflow-hidden rounded-lg shadow-md aspect-[1/1.414] group">
					<Image
						src={`/assets/img/${template.name}.png`}
						alt={templateImageAlt(template)}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
						className="object-cover object-top"
					/>
					<div className="absolute top-2 right-2 z-30">
						<TemplateCatalogBadges
							isFeatured={template.isFeatured}
							isPremium={template.isPremium}
							size="md"
						/>
					</div>
					<p className="absolute bottom-0 inset-x-0 text-center text-sm font-semibold px-2 py-1 bg-black/40 text-white">
						{template.name}
					</p>
					<div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-black/40 transition">
						<Link href={`/cv/0?template=${encodeURIComponent(template.name)}`}>
							<Button
								type="button"
								label="Utiliser ce modèle"
								className="bg-transparent hover:bg-gray-100/40 text-white font-bold"
								outlined
							/>
						</Link>
					</div>
				</div>
			</div>
		);
	};

	const listTemplate = (templates: TemplateCv[]) => {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-white dark:bg-black">
				{templates.map((template) => gridItem(template))}
			</div>
		);
	};

	return (
		<div className={"w-full p-4 md:p-8 relative flex flex-col gap-8"}>
			<div className="w-full" style={{ height: "calc(100vh - 114px)" }}>
				<AppCard className="min-h-full flex gap-2">
					<div className="w-full xl:w-1/2 lg:pl-8 xl:pl-40 min-h-full flex flex-col justify-center gap-3 sm:gap-6 -ml-2 sm:-ml-4">
						<div className="flex flex-col-reverse gap-1 sm:gap-2">
							<h1 className="font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-6 sm:leading-9 lg:leading-12">
								Des modèles pro, entièrement modulables, créez votre CV sur{" "}
								<span className="font-light">Original</span>
								<span className="text-primary dark:text-primary-dark">CV</span>
							</h1>
							<SiteBrandLogo className="h-20 sm:h-28 lg:h-32 w-auto self-start" />
						</div>

						{breakpoint && (
							<Link href="/cv/0" className="mt-2 self-start">
								<Button
									label="Créer votre CV gratuitement"
									className="bg-primary hover:bg-primary-dark dark:bg-primary-dark hover:dark:bg-primary text-white dark:text-black font-bold"
									size={!isSm ? "small" : "large"}
								/>
							</Link>
						)}
						{status !== "authenticated" && (
							<Link
								className="text-primary hover:text-primary-dark dark:text-primary-dark hover:dark:text-primary hover:underline self-start"
								href="/register"
							>
								Créer un compte gratuitement
							</Link>
						)}
					</div>
				</AppCard>
			</div>

			<section className="w-full rounded-xl bg-primary dark:bg-primary-dark px-6 py-7 sm:px-10 sm:py-8 md:px-14">
				<div className="max-w-5xl mx-auto flex flex-col gap-2.5 text-center">
					<h2 className="m-0 font-bold text-lg sm:text-xl lg:text-2xl leading-snug text-white dark:text-black">
						Un CV clair et soigné, pensé pour convaincre
					</h2>
					<div className="flex flex-col gap-0.5">
						<p className="m-0 text-sm sm:text-base text-white/90 dark:text-black/80 leading-relaxed">
							Choisissez un modèle professionnel, ajustez couleurs et mise en page, puis partez
							d&apos;une base solide — sans repartir de zéro.
						</p>
						<p className="m-0 text-sm sm:text-base text-white/90 dark:text-black/80 leading-relaxed">
							L&apos;objectif : un rendu net, lisible et crédible pour les recruteurs.
						</p>
					</div>
				</div>
			</section>

			<div className="w-full">
				<AppCard className="min-h-full flex flex-col gap-4 items-center py-8 px-16">
					<TitleAppTwo as="h2" firstPart="Créez votre" secondPart="CV" size="text-4xl" withSpace />
					<div className="flex flex-col gap-0 text-center">
						<p className="text-2xl">Choisissez l'un de nos nombreux templates pour votre CV.</p>
						<p className="text-2xl">Vous pouvez toujours le modifier plus tard.</p>
					</div>
					<PrimeDataView
						value={featured}
						listTemplate={listTemplate}
						layout="grid" /*header={header()}*/
						className="w-full"
					/>
					<Link href="/modeles">
						<Button
							label="Voir plus de modèles"
							outlined
							className="hover:bg-gray-300/40 dark:hover:bg-zinc-700/40"
						/>
					</Link>
				</AppCard>
			</div>

			<section className="w-full rounded-xl bg-white dark:bg-black px-6 py-10 sm:px-10 md:px-16 shadow-md">
				<div className="max-w-5xl mx-auto flex flex-col gap-8">
					<div className="text-center flex flex-col gap-2">
						<h2 className="m-0 font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-50">
							Comment ça marche
						</h2>
						<p className="m-0 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
							Trois étapes pour un CV prêt à envoyer.
						</p>
					</div>
					<ol className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-14 lg:gap-20">
						<li className="flex flex-col gap-2 text-center">
							<span className="text-sm font-semibold text-primary dark:text-primary-dark">
								1. Choisir un modèle
							</span>
							<p className="m-0 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
								Parcourez les templates et partez d&apos;une base pro adaptée à votre profil.
							</p>
						</li>
						<li className="flex flex-col gap-2 text-center">
							<span className="text-sm font-semibold text-primary dark:text-primary-dark">
								2. Personnaliser
							</span>
							<p className="m-0 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
								Ajustez couleurs, mise en page et contenu — tout est modulable.
							</p>
						</li>
						<li className="flex flex-col gap-2 text-center">
							<span className="text-sm font-semibold text-primary dark:text-primary-dark">
								3. Télécharger ou sauver
							</span>
							<p className="m-0 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
								Exportez votre CV ou enregistrez-le pour y revenir plus tard.
							</p>
						</li>
					</ol>
				</div>
			</section>

			{status !== "authenticated" && (
				<section className="w-full rounded-xl bg-white dark:bg-black px-6 py-8 sm:px-10 md:px-14 shadow-md">
					<div className="max-w-3xl mx-auto flex flex-col items-center gap-4 text-center">
						<h2 className="m-0 font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-50">
							Créez un compte gratuit
						</h2>
						<p className="m-0 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
							Sauvegardez vos CV, revenez y travailler plus tard, et débloquez des avantages au fil
							de votre utilisation.
						</p>
						<Link href="/register">
							<Button
								label="Créer un compte"
								className="bg-primary hover:bg-primary-dark dark:bg-primary-dark hover:dark:bg-primary text-white dark:text-black font-bold"
								size={!isSm ? "small" : "large"}
							/>
						</Link>
					</div>
				</section>
			)}

			<section className="w-full rounded-xl bg-primary dark:bg-primary-dark px-6 py-8 sm:px-10 md:px-14">
				<div className="max-w-3xl mx-auto flex flex-col items-center gap-4 text-center">
					<h2 className="m-0 font-bold text-xl sm:text-2xl text-white dark:text-black">
						Prêt à créer le vôtre ?
					</h2>
					<p className="m-0 text-sm sm:text-base text-white/90 dark:text-black/80">
						Choisissez un modèle et composez un CV clair en quelques minutes.
					</p>
					<Link href="/cv/0">
						<Button
							label="Créer votre CV gratuitement"
							className="bg-white hover:bg-zinc-100 dark:bg-black dark:hover:bg-zinc-900 text-primary dark:text-primary-dark font-bold border-0"
							size={!isSm ? "small" : "large"}
						/>
					</Link>
				</div>
			</section>
		</div>
	);
};
