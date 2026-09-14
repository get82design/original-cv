import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { trpc } from "@utils/trpc";
import type { Color, TemplateCv } from "@utils/trpc.types";
import Link from "next/link";
import { Button } from "primereact/button";
import { FormProvider, useForm } from "react-hook-form";
import { OneColumnModel } from "../cv-editor/component/kit-dnd/one-column-model/OneColumnModel";
import { switchTemplate } from "../cv-editor/utils/applyTemplateToForm";
import { useEffect, useRef, useState } from "react";
import { useModelAndColorContext } from "../cv-editor/component/context/ModelAndColorContext";
import { galleryDemoValues } from "./galleryDemoValues";
import { ProgressSpinner } from "primereact/progressspinner";
import { MdOutlineEdit } from "react-icons/md";
import { PageLayoutRegister } from "../cv-editor/component/kit-dnd/register/PageLayoutRegister";

function GalleryMiniCv({ template, color}: { template: TemplateCv, color: Color | null }) {
	const methods = useForm({
		defaultValues: switchTemplate(galleryDemoValues, template, {
			updateModules: true,
		}),
	});

	const key =
		methods.watch("layoutGeneral.defaultStyles.components.pageLayout") ??
		"OneColumnModel";
    const PageLayout = PageLayoutRegister[key] ?? OneColumnModel;

	useEffect(() => {
		const original =
		  (template.defaultStyles as { primaryColor?: Color })?.primaryColor;
		methods.setValue(
		  "layoutGeneral.defaultStyles.primaryColor",
		  color ?? original,
		);
	}, [color, methods, template]);

	const ref = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0.3);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver(([e]) => {
			setScale(e.contentRect.width / 940);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	return (
		<FormProvider {...methods}>
			<div
				ref={ref}
				className="group relative w-full aspect-[1/1.414] overflow-hidden"
			>
				<div
					className="pointer-events-none origin-top-left"
					style={{
						width: 940,
						height: 1300,
						transform: `scale(${scale})`,
					}}
				>
					<PageLayout deleteSection={() => {}} />
				</div>
				<p className="absolute bottom-0 inset-x-0 z-10 text-center text-sm font-semibold px-2 py-1 bg-black/40 text-white">
					{template.name}
				</p>
				<div className="absolute inset-0 z-20 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-black/40 transition">
					<Link href={`/cv/0?template=${encodeURIComponent(template.name)}${
						color ? `&color=${encodeURIComponent(color.name)}` : ""
					}`}>
						<Button
							type="button"
							label="Utiliser ce modèle"
							className="bg-transparent hover:bg-gray-100/40 text-white font-bold"
							outlined
						/>
					</Link>
				</div>
			</div>
		</FormProvider>
	);
}

export default function ModelList() {
	const { data: templates, isLoading: isLoadingTemplates } = trpc.cvTemplate.findAll.useQuery();
	const { colors } = useModelAndColorContext();
	const [visibleCount, setVisibleCount] = useState(0);
	useEffect(() => {
		if (!templates?.length) return;
		let n = 0;
		const step = () => {
			n = Math.min(n + 3, templates.length);
			setVisibleCount(n);
			if (n < templates.length) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}, [templates]);

	const [picked, setPicked] = useState<Color | null>(null);
	const [colorLoading, setColorLoading] = useState(false);
	const onPickColor = (color: Color) => {
		setColorLoading(true);
		// laisse d’abord peindre le spinner
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setPicked(color);
				requestAnimationFrame(() => setColorLoading(false));
			});
		});
	};

	return (
		<div className="w-full p-6">
			<AppCard className="min-h-full flex flex-col gap-4 items-center py-8 px-16">
				<TitleAppTwo
					firstPart="Choisissez un modèle"
					secondPart="CV"
					size="text-4xl"
					withSpace
				/>
				<p>
					Commencez par choisir un CV parmi notre sélection. Vous pourrez en
					changer plus tard.
				</p>
				<div className="flex flex-wrap gap-2 justify-center">
					{colors
						.filter((c) => c.name !== "black")
						.map((color) => {
							const selected = picked?.name === color.name;
							return (
								<button
									key={color.name}
									type="button"
									aria-label={color.name}
									className="w-8 h-8 rounded-full cursor-pointer"
									style={{
										backgroundColor: `var(--${color.name}${color.primary ?? ""})`,
										outline: selected
											? "2px solid var(--teal-500)"
											: "2px solid transparent",
										outlineOffset: 2,
									}}
									onClick={() => {
										onPickColor(color)
								    }}
								/>
							);
					    })
					}
					<Button
						type="button"
						// label="Couleurs d'origine"
						text
						size="small"
						className="cursor-pointer"
						disabled={!picked}
						onClick={() => {
							setColorLoading(true);
							requestAnimationFrame(() => {
								setPicked(null);
								requestAnimationFrame(() => setColorLoading(false));
							});
						}}
					><MdOutlineEdit className="w-4 h-4" /></Button>
				</div>
				{isLoadingTemplates || visibleCount === 0 ? (
					<div className="w-full flex justify-center py-16">
						<ProgressSpinner />
					</div>
				) : (
					<>
						<div
							className="w-full relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 [grid-template-columns:repeat(4,minmax(0,1fr))]"
						>
							{colorLoading && (
								<div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60">
									<ProgressSpinner />
								</div>
							)}
							{templates?.slice(0, visibleCount).map((t) => (
								<div key={t.id} className="w-full min-w-0">
									<GalleryMiniCv template={t} color={picked} />
								</div>
							))}
						</div>
						{visibleCount < (templates?.length ?? 0) && (
							<div className="w-full flex justify-center py-8">
							<ProgressSpinner />
							</div>
						)}
					</>
				)}
			</AppCard>
		</div>
	);
}
