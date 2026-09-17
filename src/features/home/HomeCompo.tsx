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

export const HomeComponent = () => {
	const breakpoint = useMediaQuery("(min-width: 1024px)");
	const isSm = useMediaQuery("(min-width: 640px)");
	const { data: session, status } = useSession();
	const { data: templates } = trpc.cvTemplate.findAll.useQuery();
	const featured = templates?.slice(0, 8);

	const gridItem = (template: TemplateCv) => {
		return (
			<div
				className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg"
				key={template.id}
			>
				<div className="relative overflow-hidden rounded-lg shadow-md aspect-[1/1.414] group">
					<Image
						src={`/assets/img/${template.name}.png`}
						alt={template.name}
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
						className="object-cover object-top"
					/>
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
			<div className="w-full" style={{ height: "calc(100vh - 134px)" }}>
				<AppCard className="min-h-full flex gap-2">
					<div className="w-full xl:w-1/2 lg:pl-8 xl:pl-40 min-h-full flex flex-col justify-center gap-3 sm:gap-6 -ml-2 sm:-ml-4">
						<div className="flex flex-col-reverse gap-1 sm:gap-2">
							<h1 className="font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-6 sm:leading-9 lg:leading-12">
								Créer votre CV gratuitement en quelques minutes sur{" "}
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
			<div className="w-full">
				<AppCard className="min-h-full flex flex-col gap-4 items-center py-8 px-16">
					<TitleAppTwo
						firstPart="Créez votre"
						secondPart="CV"
						size="text-4xl"
						withSpace
					/>
					<div className="flex flex-col gap-0 text-center">
						<p className="text-2xl">
							Choisissez l'un de nos nombreux templates pour votre CV.
						</p>
						<p className="text-2xl">
							Vous pouvez toujours le modifier plus tard.
						</p>
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
		</div>
	);
};
