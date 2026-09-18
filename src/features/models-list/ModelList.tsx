import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { trpc } from "@utils/trpc";
import type { Color, TemplateCv } from "@utils/trpc.types";
import Link from "next/link";
import { Button } from "primereact/button";
import { FormProvider, useForm } from "react-hook-form";
import { OneColumnModel } from "../cv-editor/component/kit-dnd/one-column-model/OneColumnModel";
import { switchTemplate } from "../cv-editor/utils/applyTemplateToForm";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useModelAndColorContext } from "../cv-editor/component/context/ModelAndColorContext";
import { galleryDemoValues } from "./galleryDemoValues";
import { LoadingBadge } from "@/components/feedback/LoadingBadge";
import { ProgressSpinner } from "primereact/progressspinner";
import { PageLayoutRegister } from "../cv-editor/component/kit-dnd/register/PageLayoutRegister";
import Image from "next/image";
import { Sidebar } from "primereact/sidebar";
import { Toast } from "primereact/toast";
import { GalleryModTips } from "./GalleryModTips";
import {
	CV_TEXTAREA_RECALC_EVENT,
	remesureTextareas,
} from "@/components/input-writer/input-textarea-cv/InputTextareaCv";

type ElmSize = "sm" | "md" | "lg";
type ColumnFilter = "all" | 1 | 2;
const MAX_SELECTION = 10;
const SELECTION_LIMIT_MESSAGE =
	"Pour bien comparer, limitez-vous à 10 modèles";
const MODIFICATIONS_LIMIT_MESSAGE =
	"Pour modifier confortablement, utilisez une sélection (max 10) ou réduisez les modèles affichés.";

function getTemplateColumns(template: TemplateCv): number {
	const layout = template.structure as
		| { layout?: { columns?: number } }
		| null;
	return layout?.layout?.columns ?? 1;
}

function templateImageAlt(template: TemplateCv): string {
	const name =
		template.name.charAt(0).toUpperCase() + template.name.slice(1);
	const columns = getTemplateColumns(template);
	return `Modèle de CV ${name} — ${columns} colonne${columns > 1 ? "s" : ""}`;
}

function GalleryMiniCv({
	template,
	color,
	withPhoto,
	photoSide,
	stylePhoto,
	sidebarSide,
	marge,
	space,
}: {
	template: TemplateCv;
	color: Color | null;
	withPhoto: boolean | null;
	photoSide: "left" | "right" | null;
	stylePhoto: "circle" | "flat" | null;
	sidebarSide: "left" | "right" | null;
	marge: ElmSize | null;
	space: ElmSize | null;
}) {
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
		const original = (template.defaultStyles as { primaryColor?: Color })
			?.primaryColor;
		methods.setValue(
			"layoutGeneral.defaultStyles.primaryColor",
			color ?? original,
		);
	}, [color, methods, template]);

	useEffect(() => {
		const layout = template.structure as
			| { layout?: { withPhoto?: boolean } }
			| null;
		const original = layout?.layout?.withPhoto ?? false;
		methods.setValue(
			"layoutGeneral.layout.withPhoto",
			withPhoto ?? original,
		);
	}, [withPhoto, methods, template]);

	useEffect(() => {
		const layout = template.structure as
			| { layout?: { photoSide?: "left" | "right" } }
			| null;
		const original = layout?.layout?.photoSide ?? "left";
		methods.setValue(
			"layoutGeneral.layout.photoSide",
			photoSide ?? original,
		);
	}, [photoSide, methods, template]);

	useEffect(() => {
		const layout = template.structure as
			| { layout?: { stylePhoto?: "circle" | "flat" } }
			| null;
		const original = layout?.layout?.stylePhoto ?? "circle";
		methods.setValue(
			"layoutGeneral.layout.stylePhoto",
			stylePhoto ?? original,
		);
	}, [stylePhoto, methods, template]);

	useEffect(() => {
		const layout = template.structure as
			| { layout?: { sidebarSide?: "left" | "right" } }
			| null;
		const original = layout?.layout?.sidebarSide ?? "left";
		methods.setValue(
			"layoutGeneral.layout.sidebarSide",
			sidebarSide ?? original,
		);
	}, [sidebarSide, methods, template]);

	useEffect(() => {
		const layout = template.structure as
			| { layout?: { marge?: ElmSize } }
			| null;
		const original = layout?.layout?.marge ?? "md";
		methods.setValue("layoutGeneral.layout.marge", marge ?? original);
	}, [marge, methods, template]);

	useEffect(() => {
		const layout = template.structure as
			| { layout?: { space?: ElmSize } }
			| null;
		const original = layout?.layout?.space ?? "md";
		methods.setValue("layoutGeneral.layout.space", space ?? original);
	}, [space, methods, template]);

	const ref = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState<number | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			setScale(entry.contentRect.width / 940);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	// CSS transform doesn't change layout size → ResizeObserver on textareas
	// won't fire when scale goes 0 → >0. Remesure once the mini-CV is visible.
	useLayoutEffect(() => {
		if (scale == null || scale <= 0) return;
		const root = ref.current;
		if (!root) return;
		const id = requestAnimationFrame(() => {
			remesureTextareas(root);
			window.dispatchEvent(new Event(CV_TEXTAREA_RECALC_EVENT));
		});
		return () => cancelAnimationFrame(id);
	}, [scale]);

	return (
		<FormProvider {...methods}>
			<div
				ref={ref}
				className="group absolute inset-0 overflow-hidden"
				style={{ opacity: scale == null ? 0 : 1 }}
			>
				<div
					className="pointer-events-none origin-top-left"
					style={{
						width: 940,
						height: 1300,
						transform: `scale(${scale ?? 0})`,
					}}
				>
					<PageLayout deleteSection={() => {}} />
				</div>
				<p className="absolute bottom-0 inset-x-0 z-10 text-center text-sm font-semibold px-2 py-1 bg-black/40 text-white">
					{template.name}
				</p>
				<div className="absolute inset-0 z-20 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-black/40 transition">
					<Link
						href={`/cv/0?template=${encodeURIComponent(template.name)}${
							color ? `&color=${encodeURIComponent(color.name)}` : ""
						}`}
					>
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

function GalleryCard({
	template,
	color,
	withPhoto,
	photoSide,
	stylePhoto,
	sidebarSide,
	marge,
	space,
	live,
	selected,
	selectionDisabled,
	onToggleSelected,
	onSelectionLimit,
}: {
	template: TemplateCv;
	color: Color | null;
	withPhoto: boolean | null;
	photoSide: "left" | "right" | null;
	stylePhoto: "circle" | "flat" | null;
	sidebarSide: "left" | "right" | null;
	marge: ElmSize | null;
	space: ElmSize | null;
	live: boolean;
	selected: boolean;
	selectionDisabled: boolean;
	onToggleSelected: () => void;
	onSelectionLimit: () => void;
}) {
	return (
		<div className="group relative w-full min-w-0 aspect-[1/1.414] overflow-hidden rounded-lg">
			<button
				type="button"
				aria-label={
					selected
						? `Retirer ${template.name} de la sélection`
						: selectionDisabled
							? SELECTION_LIMIT_MESSAGE
							: `Ajouter ${template.name} à la sélection`
				}
				aria-pressed={selected}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					if (selectionDisabled) {
						onSelectionLimit();
						return;
					}
					onToggleSelected();
				}}
				className={`absolute top-2 left-2 z-40 flex h-7 w-7 items-center justify-center rounded-md border shadow-sm transition-opacity duration-150 ${
					selected
						? "opacity-100 border-teal-500 bg-teal-500 text-white"
						: `opacity-0 group-hover:opacity-100 focus:opacity-100 ${
								selectionDisabled
									? "cursor-not-allowed border-white/60 bg-white/60 text-gray-400"
									: "border-white/80 bg-white/90 text-gray-500 hover:bg-white"
							}`
				}`}
			>
				{selected ? <i className="pi pi-check text-xs" /> : null}
			</button>
			<Image
				src={`/assets/img/${template.name}.png`}
				alt={templateImageAlt(template)}
				fill
				sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
				className="object-cover object-top"
			/>
			{!live && (
				<>
					<p className="absolute bottom-0 inset-x-0 z-10 text-center text-sm font-semibold px-2 py-1 bg-black/40 text-white">
						{template.name}
					</p>
					<div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 bg-black/40 transition">
						<Link
							href={`/cv/0?template=${encodeURIComponent(template.name)}${
								color ? `&color=${encodeURIComponent(color.name)}` : ""
							}`}
						>
							<Button
								type="button"
								label="Utiliser ce modèle"
								className="bg-transparent hover:bg-gray-100/40 text-white font-bold"
								outlined
							/>
						</Link>
					</div>
				</>
			)}
			{live && (
				<GalleryMiniCv
					template={template}
					color={color}
					withPhoto={withPhoto}
					photoSide={photoSide}
					stylePhoto={stylePhoto}
					sidebarSide={sidebarSide}
					marge={marge}
					space={space}
				/>
			)}
		</div>
	);
}

export default function ModelList() {
	const { data: templates, isLoading: isLoadingTemplates } =
		trpc.cvTemplate.findAll.useQuery();
	const { colors } = useModelAndColorContext();
	const toast = useRef<Toast>(null);
	const PAGE = 9;
	const [shownCount, setShownCount] = useState(0); // cartes visibles (images)
	const [liveCount, setLiveCount] = useState(0); // mini-CV montés
	const [visibleSidebar, setVisibleSidebar] = useState(false);
	const [columnFilter, setColumnFilter] = useState<ColumnFilter>("all");
	const [filterLoading, setFilterLoading] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
	const [selectionMode, setSelectionMode] = useState(false);

	const filteredTemplates = useMemo(() => {
		if (!templates?.length) return [];
		let list = templates;
		if (columnFilter !== "all") {
			list = list.filter((t) => getTemplateColumns(t) === columnFilter);
		}
		if (selectionMode) {
			list = list.filter((t) => selectedIds.has(t.id));
		}
		return list;
	}, [templates, columnFilter, selectionMode, selectedIds]);

	const selectedCount = selectedIds.size;

	useEffect(() => {
		if (!templates?.length) return;
		setShownCount(Math.min(PAGE, templates.length));
		setLiveCount(0);
	}, [templates]);

	useEffect(() => {
		if (!filteredTemplates.length) {
			setShownCount(0);
			setLiveCount(0);
			return;
		}
		setShownCount(Math.min(PAGE, filteredTemplates.length));
	}, [columnFilter, selectionMode, filteredTemplates]);

	// Si la galerie rétrécit (filtre / sélection), liveCount ne doit pas rester trop haut
	useEffect(() => {
		setLiveCount((n) => (n > shownCount ? shownCount : n));
	}, [shownCount]);

	useEffect(() => {
		if (liveCount >= shownCount) return;
		const id = requestAnimationFrame(() => setLiveCount((n) => n + 1));
		return () => cancelAnimationFrame(id);
	}, [liveCount, shownCount]);

	const shown = filteredTemplates.slice(0, shownCount);
	const hasMore = shownCount < filteredTemplates.length;
	const activeLiveCount = Math.min(liveCount, shownCount);
	const galleryReady = shownCount > 0 && activeLiveCount >= shownCount;
	const modificationsLocked = activeLiveCount > MAX_SELECTION;
	const showGalleryLoader =
		filterLoading ||
		(!isLoadingTemplates &&
			filteredTemplates.length > 0 &&
			!galleryReady);

	useEffect(() => {
		if (!modificationsLocked) return;
		setVisibleSidebar(false);
	}, [modificationsLocked]);

	const showModificationsLimitMessage = () => {
		toast.current?.show({
			severity: "info",
			summary: "Modifications",
			detail: MODIFICATIONS_LIMIT_MESSAGE,
			life: 5000,
		});
	};

	const openModifications = () => {
		if (modificationsLocked) {
			showModificationsLimitMessage();
			return;
		}
		setVisibleSidebar(true);
	};

	useEffect(() => {
		if (!filterLoading) return;
		if (filteredTemplates.length === 0) {
			setFilterLoading(false);
			return;
		}
		if (!galleryReady) return;
		const id = requestAnimationFrame(() => {
			requestAnimationFrame(() => setFilterLoading(false));
		});
		return () => cancelAnimationFrame(id);
	}, [
		filterLoading,
		galleryReady,
		filteredTemplates.length,
		columnFilter,
		selectionMode,
	]);

	const runWithLoader = (action: () => void) => {
		setFilterLoading(true);
		requestAnimationFrame(() => {
			requestAnimationFrame(action);
		});
	};

	const applyColumnFilter = (filter: ColumnFilter) => {
		if (filter === columnFilter || filterLoading) return;
		runWithLoader(() => setColumnFilter(filter));
	};

	const showSelectionLimitMessage = () => {
		toast.current?.show({
			severity: "info",
			summary: "Sélection",
			detail: SELECTION_LIMIT_MESSAGE,
			life: 4000,
		});
	};

	const toggleSelected = (id: string) => {
		if (selectedIds.has(id)) {
			setSelectedIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
			return;
		}
		if (selectedCount >= MAX_SELECTION) {
			showSelectionLimitMessage();
			return;
		}
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.add(id);
			return next;
		});
	};

	const selectionFull = selectedCount >= MAX_SELECTION;

	const applySelection = () => {
		if (selectedCount === 0 || filterLoading || selectionMode) return;
		runWithLoader(() => {
			setColumnFilter("all");
			setSelectionMode(true);
		});
	};

	const exitSelectionMode = () => {
		if (!selectionMode || filterLoading) return;
		runWithLoader(() => setSelectionMode(false));
	};

	const clearSelection = () => {
		setSelectedIds(new Set());
		if (selectionMode) {
			runWithLoader(() => setSelectionMode(false));
		}
	};

	const [picked, setPicked] = useState<Color | null>(null);
	const [colorLoading, setColorLoading] = useState(false);
	const [withPhoto, setWithPhoto] = useState<boolean | null>(null);
	const [photoSide, setPhotoSide] = useState<"left" | "right" | null>(null);
	const [stylePhoto, setStylePhoto] = useState<"circle" | "flat" | null>(
		null,
	);
	const [sidebarSide, setSidebarSide] = useState<"left" | "right" | null>(
		null,
	);
	const [marge, setMarge] = useState<ElmSize | null>(null);
	const [space, setSpace] = useState<ElmSize | null>(null);

	const onPickColor = (color: Color) => {
		setColorLoading(true);
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setPicked(color);
				requestAnimationFrame(() => setColorLoading(false));
			});
		});
	};

	return (
		<div className="w-full p-6 relative">
			<Toast ref={toast} position="top-center" />
			<Button
				outlined
				aria-disabled={modificationsLocked}
				title={
					modificationsLocked ? MODIFICATIONS_LIMIT_MESSAGE : undefined
				}
				className={`fixed z-40 bg-white dark:bg-gray-800 text-primary-color dark:text-primary-color-dark top-28 -right-11 rotate-270 ${
					modificationsLocked ? "opacity-50" : ""
				}`}
				onClick={openModifications}
			>
				Modifications
			</Button>
			<Sidebar
				header="Panneau de modification"
				visible={visibleSidebar}
				position="right"
				onHide={() => setVisibleSidebar(false)}
				className="sidebar-model-list"
				pt={{ content: { className: "flex flex-col h-full" } }}
			>
                <div className="flex flex-col gap-2 h-full text-zinc-900 dark:text-zinc-100">
					<div className="flex flex-col gap-1">
						<p className="my-0 font-semibold text-sm">Couleur</p>
						{galleryReady ? (
							<div className="flex flex-wrap gap-2 items-center">
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
													onPickColor(color);
												}}
											/>
										);
									})}
								<Button
									type="button"
									size="small"
									text
									icon="pi pi-replay"
									disabled={!picked}
									onClick={() => {
										setColorLoading(true);
										requestAnimationFrame(() => {
											setPicked(null);
											requestAnimationFrame(() => setColorLoading(false));
										});
									}}
								/>
							</div>
						) : (
							<p className="my-0 text-xs text-muted-color">Chargement des templates...</p>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<p className="my-0 font-semibold text-sm">Photo</p>
						<div className="flex gap-2">
							<Button
								size="small"
								label="Afficher"
								outlined={withPhoto !== true}
								onClick={() => setWithPhoto(true)}
							/>
							<Button
								size="small"
								label="Masquer"
								outlined={withPhoto !== false}
								onClick={() => setWithPhoto(false)}
							/>
							<Button
								size="small"
								text
								icon="pi pi-replay"
								disabled={withPhoto === null}
								onClick={() => setWithPhoto(null)}
							/>
						</div>
						<div className="flex gap-2">
							<Button
								size="small"
								label="Gauche"
								outlined={photoSide !== "left"}
								onClick={() => setPhotoSide("left")}
							/>
							<Button
								size="small"
								label="Droite"
								outlined={photoSide !== "right"}
								onClick={() => setPhotoSide("right")}
							/>
							<Button
								size="small"
								text
								icon="pi pi-replay"
								disabled={photoSide === null}
								onClick={() => setPhotoSide(null)}
							/>
						</div>
						<div className="flex gap-2">
							<Button
								size="small"
								label="Carré"
								outlined={stylePhoto !== "flat"}
								onClick={() => setStylePhoto("flat")}
							/>
							<Button
								size="small"
								label="Rond"
								outlined={stylePhoto !== "circle"}
								onClick={() => setStylePhoto("circle")}
							/>
							<Button
								size="small"
								text
								icon="pi pi-replay"
								disabled={stylePhoto === null}
								onClick={() => setStylePhoto(null)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<p className="my-0 font-semibold text-sm">Sidebar</p>
						<div className="flex gap-2">
							<Button
								size="small"
								label="Gauche"
								outlined={sidebarSide !== "left"}
								onClick={() => setSidebarSide("left")}
							/>
							<Button
								size="small"
								label="Droite"
								outlined={sidebarSide !== "right"}
								onClick={() => setSidebarSide("right")}
							/>
							<Button
								size="small"
								text
								icon="pi pi-replay"
								disabled={sidebarSide === null}
								onClick={() => setSidebarSide(null)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<p className="my-0 font-semibold text-sm">Marges</p>
						<div className="flex gap-2">
							{(["sm", "md", "lg"] as const).map((size) => (
								<Button
									key={size}
									size="small"
									label={size}
									outlined={marge !== size}
									onClick={() => setMarge(size)}
								/>
							))}
							<Button
								size="small"
								text
								icon="pi pi-replay"
								disabled={marge === null}
								onClick={() => setMarge(null)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<p className="my-0 font-semibold text-sm">Espaces</p>
						<div className="flex gap-2">
							{(["sm", "md", "lg"] as const).map((size) => (
								<Button
									key={size}
									size="small"
									label={size}
									outlined={space !== size}
									onClick={() => setSpace(size)}
								/>
							))}
							<Button
								size="small"
								text
								icon="pi pi-replay"
								disabled={space === null}
								onClick={() => setSpace(null)}
							/>
						</div>
					</div>
					<GalleryModTips />
				</div>
            </Sidebar>
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
				<div className="flex flex-wrap gap-2 justify-center items-center">
					<Button
						size="small"
						label="Tous"
						outlined={columnFilter !== "all"}
						onClick={() => applyColumnFilter("all")}
					/>
					<Button
						size="small"
						label="1 colonne"
						outlined={columnFilter !== 1}
						onClick={() => applyColumnFilter(1)}
					/>
					<Button
						size="small"
						label="2 colonnes"
						outlined={columnFilter !== 2}
						onClick={() => applyColumnFilter(2)}
					/>
					<span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" aria-hidden />
					{selectionMode ? (
						<>
							<Button
								size="small"
								label={`Sélection · ${filteredTemplates.length}`}
								outlined={false}
								disabled
							/>
							<Button
								size="small"
								label="Tous les modèles"
								outlined
								onClick={exitSelectionMode}
							/>
						</>
					) : (
						<>
							<Button
								size="small"
								label={
									selectedCount > 0
										? `Utiliser la sélection (${selectedCount}/${MAX_SELECTION})`
										: "Utiliser la sélection"
								}
								outlined
								disabled={selectedCount === 0 || filterLoading}
								onClick={applySelection}
							/>
							{selectedCount > 0 && (
								<Button
									size="small"
									text
									label="Tout décocher"
									onClick={clearSelection}
								/>
							)}
						</>
					)}
				</div>
				{isLoadingTemplates ? (
					<div className="w-full flex justify-center py-16">
						<ProgressSpinner />
					</div>
				) : filteredTemplates.length === 0 ? (
					<p className="text-center text-muted-color">
						{selectionMode
							? "Aucun modèle sélectionné pour ce filtre."
							: "Aucun modèle ne correspond à ce filtre."}
					</p>
				) : (
					<>
						<div className="w-full relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 [grid-template-columns:repeat(4,minmax(0,1fr))]">
							{filterLoading && (
								<div
									className="absolute inset-0 z-20 bg-white/45 dark:bg-black/35 pointer-events-none transition-opacity duration-150"
									aria-hidden
								/>
							)}
							{colorLoading && (
								<div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60">
									<ProgressSpinner />
								</div>
							)}
							{shown?.map((t, i) => (
								<GalleryCard
									key={t.id}
									template={t}
									color={picked}
									withPhoto={withPhoto}
									photoSide={photoSide}
									stylePhoto={stylePhoto}
									sidebarSide={sidebarSide}
									marge={marge}
									space={space}
									live={i < liveCount}
									selected={selectedIds.has(t.id)}
									selectionDisabled={
										selectionFull && !selectedIds.has(t.id)
									}
									onToggleSelected={() => toggleSelected(t.id)}
									onSelectionLimit={showSelectionLimitMessage}
								/>
							))}
						</div>
						{hasMore && (
							<Button
								type="button"
								label="Voir plus"
								onClick={() =>
									setShownCount((n) =>
										Math.min(n + PAGE, filteredTemplates.length),
									)
								}
							/>
						)}
					</>
				)}
			</AppCard>
			<LoadingBadge visible={showGalleryLoader} />
		</div>
	);
}
