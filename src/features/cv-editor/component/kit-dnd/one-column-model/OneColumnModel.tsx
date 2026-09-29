import { ChangePaddingDocument } from "@/features/cv-editor/utils/utilsCv/marge";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { resolveMonoHeaderEntry } from "../../template/register/header/HeaderRegister";
import { useCreateCvContext } from "../../context/CreateCvContext";
import { SectionSortableContext } from "../shared/SectionSortableContext";
import type { ItemGeneralProps } from "@utils/type";
import { useCvSectionItems } from "../shared/useCvSectionItems";
import { useCvPageDnd } from "../shared/useCvPageDnd";
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color";
import { CvPageShell } from "../shared/CvPageShell";
import { useElementHeights } from "../shared/useElementHeights";
import {
	cvPageContentHeight,
	packSectionsIntoPages,
	type CvMarge,
} from "@/features/cv-editor/utils/cvPage";
import type { SectionItem } from "../shared/SectionCatalog";
import {
	useCvPageScrollLock,
	useDebouncedHeights,
	useFrozenPackingHeights,
} from "../shared/useCvPageScrollLock";

const HEADER_MEASURE_ID = "__cv_header__";

export interface OneColumnModelProps {
	deleteSection: (item: ItemGeneralProps) => void;
}

export const OneColumnModel = ({ deleteSection }: OneColumnModelProps) => {
	const paddingDoc = ChangePaddingDocument();
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const { watch } = useFormContext();

	const itemUse = useCvSectionItems(0);
	const sortedItems = useMemo(
		() => [...itemUse].sort((a, b) => a.order - b.order),
		[itemUse],
	);
	const sectionIds = useMemo(() => sortedItems.map((i) => i.id), [sortedItems]);
	const itemsById = useMemo(
		() => new Map<string, SectionItem>(sortedItems.map((i) => [i.id, i])),
		[sortedItems],
	);

	const { sensors, handleDragStart, handleDragEnd, handleDragOver, collisionDetection } =
		useCvPageDnd([itemUse]);

	const primaryColor = GetPrimaryColor() ?? "white";
	const accent = watch("layoutGeneral.layout.pageAccent");
	const shade = accent?.shade;
	const marge = (watch("layoutGeneral.layout.marge") ?? "md") as CvMarge;
	const pagePad = { sm: "2rem", md: "3rem", lg: "4rem" }[marge];
	const [colorSelected, setColorSelected] = useState<string | null>(null);
	const bandStop = "calc(var(--page-pad) + (100% - 2 * var(--page-pad)) * 0.2 + 0.5rem)";

	const headerKey = watch("layoutGeneral.defaultStyles")?.components?.sectionHeader ?? "HeaderOne";
	const HeaderComponent = resolveMonoHeaderEntry(headerKey).Component;

	const measureIds = useMemo(() => [HEADER_MEASURE_ID, ...sectionIds], [sectionIds]);
	const { heights, setMeasureRef } = useElementHeights(measureIds);
	const stableHeights = useDebouncedHeights(heights);
	const packingHeights = useFrozenPackingHeights(stableHeights, sectionSelected);

	const contentHeight = cvPageContentHeight(marge);
	const headerHeight = packingHeights.get(HEADER_MEASURE_ID) ?? 0;

	const pages = useMemo(
		() =>
			packSectionsIntoPages({
				sectionIds,
				heights: packingHeights,
				headerHeight,
				contentHeight,
			}),
		[sectionIds, packingHeights, headerHeight, contentHeight],
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

	const renderSection = (item: SectionItem) => (
		// biome-ignore lint/a11y/noStaticElementInteractions: <wrapper de section : enfants déjà interactifs>
		// biome-ignore lint/a11y/useKeyWithClickEvents: <sélection de section>
		<div
			key={item.id}
			ref={setMeasureRef(item.id)}
			className="sections-container w-full"
			onClick={() => selectSection(item.id)}
		>
			<SectionSortableContext
				item={item}
				deleteSection={deleteSection}
				sectionMenu={item.sectionMenu}
			/>
		</div>
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collisionDetection}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
		>
			<SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
				<div className="flex flex-col gap-6">
					{pages.map((pageSectionIds, pageIndex) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <index de page A4 stable>
						<div key={`cv-page-${pageIndex}`} className="flex flex-col gap-2">
							{pages.length > 1 && (
								<p className="text-xs text-muted-color m-0 px-1">
									Page {pageIndex + 1} / {pages.length}
								</p>
							)}
							<CvPageShell
								pageIndex={pageIndex}
								paddingClass={paddingDoc}
								pagePad={pagePad}
								background={background}
							>
								{pageIndex === 0 && (
									<button
										type="button"
										ref={setMeasureRef(HEADER_MEASURE_ID)}
										onClick={() => selectSection("header")}
										className="w-full"
									>
										{HeaderComponent && <HeaderComponent />}
									</button>
								)}
								{pageSectionIds.map((id) => {
									const item = itemsById.get(id);
									return item ? renderSection(item) : null;
								})}
							</CvPageShell>
						</div>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
};
