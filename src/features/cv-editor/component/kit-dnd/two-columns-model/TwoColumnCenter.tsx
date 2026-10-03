import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ItemGeneralProps } from "@utils/type";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
	HEADER_SIDEBAR_ID,
	HEADER_SPLIT_MAIN_ID,
	HEADER_SPLIT_SIDEBAR_ID,
	HEADER_TOP_ID,
	headerMeasureIds,
	resolveTwoColumnHeaderHeights,
} from "@/features/cv-editor/utils/cvHeaderPlacement";
import {
	CV_PAGE_HEIGHT,
	CV_PAGE_PAD_PX,
	CV_SIGNATURE_RESERVE_PX,
	type CvMarge,
	mergeTwoColumnPages,
	packSectionsIntoPages,
	twoColumnPageKey,
} from "@/features/cv-editor/utils/cvPage";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color";
import {
	ChangePaddingDocument,
	columnPaddingForHeaderPlacement,
} from "@/features/cv-editor/utils/utilsCv/marge";
import type { HeaderPlacement } from "@/services/schemas/cvTemplate.schema";
import { useCreateCvContext } from "../../context/CreateCvContext";
import {
	resolveMonoHeaderEntry,
	resolveSplitHeaderEntry,
} from "../../template/register/header/HeaderRegister";
import { ColumnDropZone } from "../shared/ColumnDropZone";
import { resolveSidebarFg } from "../shared/ColumnFgContext";
import { CvPageShell } from "../shared/CvPageShell";
import type { SectionItem } from "../shared/SectionCatalog";
import { SectionSortableContext } from "../shared/SectionSortableContext";
import { useCvPageDnd } from "../shared/useCvPageDnd";
import {
	useCvPageScrollLock,
	useDebouncedHeights,
	useFrozenPackingHeights,
} from "../shared/useCvPageScrollLock";
import { useCvSectionItems } from "../shared/useCvSectionItems";
import { useElementHeights } from "../shared/useElementHeights";

export interface TwoColumnCenterProps {
	deleteSection: (item: ItemGeneralProps) => void;
}

/**
 * Layout 2 colonnes égales (50 % / 50 %).
 * `pageLayout: "TwoColumnCenter"` — colonnes 0 / 1, DnD libre (pas de `sidebarColumn`).
 * Diffère de `TwoColumnSideBar` (3/8 + 5/8 + types sidebar restreints) par la largeur et le DnD.
 */
export function TwoColumnCenter({ deleteSection }: TwoColumnCenterProps) {
	const paddingDoc = ChangePaddingDocument();
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const { watch } = useFormContext();
	const sidebarSide = watch(FieldNameLayoutGeneral.sidebarSide) ?? "left";
	const headerPlacement = (watch(FieldNameLayoutGeneral.headerPlacement) ??
		"top") as HeaderPlacement;
	const columnPadding = columnPaddingForHeaderPlacement(
		paddingDoc,
		headerPlacement,
	);

	const left = useCvSectionItems(0);
	const right = useCvSectionItems(1);
	const sidebarItems = useMemo(
		() => [...left].sort((a, b) => a.order - b.order),
		[left],
	);
	const mainItems = useMemo(
		() => [...right].sort((a, b) => a.order - b.order),
		[right],
	);
	const sidebarIds = useMemo(
		() => sidebarItems.map((i) => i.id),
		[sidebarItems],
	);
	const mainIds = useMemo(() => mainItems.map((i) => i.id), [mainItems]);
	const sidebarById = useMemo(
		() => new Map<string, SectionItem>(sidebarItems.map((i) => [i.id, i])),
		[sidebarItems],
	);
	const mainById = useMemo(
		() => new Map<string, SectionItem>(mainItems.map((i) => [i.id, i])),
		[mainItems],
	);

	const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
	const activeItem = [...left, ...right].find((i) => i.id === activeSectionId);
	const {
		sensors,
		handleDragStart,
		handleDragEnd,
		handleDragOver,
		collisionDetection,
	} = useCvPageDnd([left, right]);

	const primaryColor = GetPrimaryColor() ?? "white";
	const accent = watch(FieldNameLayoutGeneral.pageAccent);
	const sidebarTheme = watch(FieldNameLayoutGeneral.sidebarTheme);
	const sidebarBgColor = sidebarTheme?.bgColor;
	const sidebarShadeBgColor = sidebarTheme?.shadeBgColor;
	const sidebarFg = sidebarTheme?.fg;
	const shade = accent?.shade;
	const marge = (watch(FieldNameLayoutGeneral.marge) ?? "md") as CvMarge;
	const pagePad = { sm: "2rem", md: "3rem", lg: "4rem" }[marge];
	const [colorSelected, setColorSelected] = useState<string | null>(null);
	const bandStop =
		"calc(var(--page-pad) + (100% - 2 * var(--page-pad)) * 0.2 + 0.5rem)";

	const hue =
		sidebarBgColor === "primaryColor"
			? primaryColor.split("-")[0]
			: sidebarBgColor;
	const cssToken =
		sidebarBgColor && (hue === "black" || hue === "white")
			? hue
			: sidebarBgColor
				? `${hue}${sidebarShadeBgColor ?? ""}`
				: undefined;
	const columnFg = resolveSidebarFg(sidebarFg, sidebarShadeBgColor);

	const headerKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionHeader ??
		"HeaderOne";
	const HeaderComponent = resolveMonoHeaderEntry(headerKey).Component;
	const splitHeader = resolveSplitHeaderEntry(headerKey);
	const SplitSidebar = splitHeader.Sidebar;
	const SplitMain = splitHeader.Main;

	const measureIds = useMemo(
		() => [...headerMeasureIds(headerPlacement), ...sidebarIds, ...mainIds],
		[sidebarIds, mainIds, headerPlacement],
	);

	const { heights, setMeasureRef } = useElementHeights(measureIds);
	const stableHeights = useDebouncedHeights(heights);
	const packingHeights = useFrozenPackingHeights(
		stableHeights,
		sectionSelected,
	);

	const padPx = CV_PAGE_PAD_PX[marge] ?? CV_PAGE_PAD_PX.md;
	const headerHeights = useMemo(
		() => resolveTwoColumnHeaderHeights(headerPlacement, packingHeights),
		[headerPlacement, packingHeights],
	);

	const columnBodyHeight = Math.max(
		1,
		CV_PAGE_HEIGHT - headerHeights.top - 2 * padPx - CV_SIGNATURE_RESERVE_PX,
	);

	const heightsForPack = useMemo(() => {
		const m = new Map(packingHeights);
		for (const id of [...sidebarIds, ...mainIds]) {
			if ((m.get(id) ?? 0) <= 0) m.set(id, 140);
		}
		return m;
	}, [packingHeights, sidebarIds, mainIds]);

	const sidebarPages = useMemo(
		() =>
			packSectionsIntoPages({
				sectionIds: sidebarIds,
				heights: heightsForPack,
				headerHeight: headerHeights.sidebar,
				contentHeight: columnBodyHeight,
			}),
		[sidebarIds, heightsForPack, headerHeights.sidebar, columnBodyHeight],
	);

	const mainPages = useMemo(
		() =>
			packSectionsIntoPages({
				sectionIds: mainIds,
				heights: heightsForPack,
				headerHeight: headerHeights.main,
				contentHeight: columnBodyHeight,
			}),
		[mainIds, heightsForPack, headerHeights.main, columnBodyHeight],
	);

	const pages = useMemo(
		() => mergeTwoColumnPages(sidebarPages, mainPages),
		[sidebarPages, mainPages],
	);

	const { lockScrollBeforeSelect } = useCvPageScrollLock();

	const background =
		accent?.type === "leftBand" && colorSelected
			? `linear-gradient(to right, var(--${colorSelected}) ${bandStop}, #fff ${bandStop})`
			: "#fff";

	useEffect(() => {
		if (shade) {
			const color = primaryColor.split("-")[0] + shade;
			setColorSelected(color);
		} else {
			setColorSelected(primaryColor);
		}
	}, [shade, primaryColor]);

	const selectSection = (id: string) => {
		lockScrollBeforeSelect();
		setSectionSelected(id);
	};

	const renderSection = (item: SectionItem, className: string) => (
		// biome-ignore lint/a11y/noStaticElementInteractions: wrapper section
		// biome-ignore lint/a11y/useKeyWithClickEvents: sélection section
		<div
			key={item.id}
			ref={setMeasureRef(item.id)}
			className={className}
			onClick={() => selectSection(item.id)}
		>
			<SectionSortableContext
				item={item}
				deleteSection={deleteSection}
				sectionMenu={item.sectionMenu}
			/>
		</div>
	);

	const allSortableIds = useMemo(
		() => [...sidebarIds, ...mainIds],
		[sidebarIds, mainIds],
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collisionDetection}
			onDragOver={handleDragOver}
			onDragStart={(e) => {
				handleDragStart(e);
				if (e.active.data.current?.type === "section") {
					setActiveSectionId(String(e.active.id));
				}
			}}
			onDragEnd={(e) => {
				setActiveSectionId(null);
				handleDragEnd(e);
			}}
			onDragCancel={() => setActiveSectionId(null)}
		>
			<SortableContext
				items={allSortableIds}
				strategy={verticalListSortingStrategy}
			>
				<div className="flex flex-col gap-6">
					{pages.map((page, pageIndex) => (
						<div key={twoColumnPageKey(page)} className="flex flex-col gap-2">
							{pages.length > 1 && (
								<p className="text-xs text-muted-color m-0 px-1">
									Page {pageIndex + 1} / {pages.length}
								</p>
							)}
							<CvPageShell
								pageIndex={pageIndex}
								paddingClass=""
								pagePad={pagePad}
								background={background}
							>
								<div className="flex h-full min-h-0 flex-col">
									{pageIndex === 0 && headerPlacement === "top" && (
										// biome-ignore lint/a11y/noStaticElementInteractions: wrapper header : PhotoField déjà en bouton
										// biome-ignore lint/a11y/useKeyWithClickEvents: sélection de section header
										<div
											ref={setMeasureRef(HEADER_TOP_ID)}
											onClick={() => selectSection("header")}
											className={`w-full shrink-0 ${paddingDoc} pb-0`}
										>
											{HeaderComponent && <HeaderComponent />}
										</div>
									)}

									<div className="sections-container grid min-h-0 w-full flex-1 grid-cols-8 gap-0">
										<ColumnDropZone
											column={0}
											pageIndex={pageIndex}
											className={`col-span-4 ${
												sidebarSide === "right" ? "order-2" : "order-1"
											} ${columnPadding}`}
											fg={columnFg}
											style={{
												backgroundColor: cssToken
													? `var(--${cssToken})`
													: undefined,
											}}
										>
											{pageIndex === 0 && headerPlacement === "sidebar" && (
												// biome-ignore lint/a11y/noStaticElementInteractions: wrapper header : PhotoField déjà en bouton
												// biome-ignore lint/a11y/useKeyWithClickEvents: sélection de section header
												<div
													ref={setMeasureRef(HEADER_SIDEBAR_ID)}
													onClick={() => selectSection("header")}
													className="w-full"
												>
													{HeaderComponent && <HeaderComponent />}
												</div>
											)}
											{pageIndex === 0 && headerPlacement === "split" && (
												// biome-ignore lint/a11y/noStaticElementInteractions: wrapper header : PhotoField déjà en bouton
												// biome-ignore lint/a11y/useKeyWithClickEvents: sélection de section header
												<div
													ref={setMeasureRef(HEADER_SPLIT_SIDEBAR_ID)}
													onClick={() => selectSection("header")}
													className="w-full"
												>
													<SplitSidebar />
												</div>
											)}
											{page.sidebarIds.map((id) => {
												const item = sidebarById.get(id);
												return item
													? renderSection(item, "sections-container-left")
													: null;
											})}
										</ColumnDropZone>

										<ColumnDropZone
											column={1}
											pageIndex={pageIndex}
											className={`col-span-4 ${
												sidebarSide === "right" ? "order-1" : "order-2"
											} ${columnPadding}`}
										>
											{pageIndex === 0 && headerPlacement === "split" && (
												// biome-ignore lint/a11y/noStaticElementInteractions: wrapper header : enfants déjà interactifs
												// biome-ignore lint/a11y/useKeyWithClickEvents: sélection de section header
												<div
													ref={setMeasureRef(HEADER_SPLIT_MAIN_ID)}
													onClick={() => selectSection("header")}
													className="w-full"
												>
													<SplitMain />
												</div>
											)}
											{page.mainIds.map((id) => {
												const item = mainById.get(id);
												return item
													? renderSection(item, "sections-container-right")
													: null;
											})}
										</ColumnDropZone>
									</div>
								</div>
							</CvPageShell>
						</div>
					))}
				</div>
			</SortableContext>

			<DragOverlay>
				{activeItem ? (
					<div className="opacity-90 bg-white shadow-lg">
						<activeItem.content />
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
