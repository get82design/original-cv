import { ChangePaddingDocument } from "@/features/cv-editor/utils/utilsCv/marge";
import type { ItemGeneralProps } from "@utils/type";
import { useEffect, useRef, useState } from "react";
import { useCreateCvContext } from "../../context/CreateCvContext";
import { useFormContext } from "react-hook-form";
import { useCvSectionItems } from "../shared/useCvSectionItems";
import { useCvPageDnd } from "../shared/useCvPageDnd";
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color";
import { HeaderRegister } from "../../template/register/header/HeaderRegister";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { ColumnDropZone } from "../shared/ColumnDropZone";
import { resolveSidebarFg } from "../shared/ColumnFgContext";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SectionSortableContext } from "../shared/SectionSortableContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";

export interface TwoColumnSideBarProps {
	deleteSection: (item: ItemGeneralProps) => void;
}
export function TwoColumnSideBar({ deleteSection }: TwoColumnSideBarProps) {
    const paddingDoc = ChangePaddingDocument();
	const refTaille = useRef<HTMLDivElement>(null);
	const { setSectionSelected } = useCreateCvContext();
	const { watch } = useFormContext();
    const sidebarSide = watch(FieldNameLayoutGeneral.sidebarSide) ?? "left";
    const headerPlacement = watch(FieldNameLayoutGeneral.headerPlacement) ?? "top";

	const left = useCvSectionItems(0);
	const right = useCvSectionItems(1);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const activeItem = [...left, ...right].find((i) => i.id === activeSectionId);
	const { sensors, handleDragEnd, handleDragOver, collisionDetection } =
		useCvPageDnd([left, right], { sidebarColumn: 0 });

	const primaryColor = GetPrimaryColor() ?? "white";
	const accent = watch(FieldNameLayoutGeneral.pageAccent);
	const sidebarTheme = watch(FieldNameLayoutGeneral.sidebarTheme);
	const sidebarBgColor = sidebarTheme?.bgColor;
	const sidebarShadeBgColor = sidebarTheme?.shadeBgColor;
	const sidebarFg = sidebarTheme?.fg;
	const shade = accent?.shade;
	const marge = (watch(FieldNameLayoutGeneral.marge) ?? "md") as
		| "sm"
		| "md"
		| "lg";
	const pagePad = { sm: "2rem", md: "3rem", lg: "4rem" }[marge];
	const [colorSelected, setColorSelected] = useState<string | null>(null);
	const bandStop =
		"calc(var(--page-pad) + (100% - 2 * var(--page-pad)) * 0.2 + 0.5rem)";

    const hue = sidebarBgColor === "primaryColor"
        ? primaryColor.split("-")[0]
        : sidebarBgColor; // "gray" | "black" | "white"
    const cssToken =
        sidebarBgColor && (hue === "black" || hue === "white")
            ? hue
            : sidebarBgColor
                ? `${hue}${sidebarShadeBgColor ?? ""}` // "gray-700"
                : undefined;
	const columnFg = resolveSidebarFg(sidebarFg, sidebarShadeBgColor);

	const headerKey =
		watch("layoutGeneral.defaultStyles")?.components?.sectionHeader ??
		"HeaderOne";
	const HeaderComponent = HeaderRegister[headerKey] ?? HeaderRegister.HeaderOne;

	useEffect(() => {
		if (shade) {
			const color = primaryColor.split("-")[0] + shade;
			setColorSelected(color);
		} else {
			setColorSelected(primaryColor);
		}
	}, [shade, primaryColor]);
	return (
        <DndContext
			sensors={sensors}
			collisionDetection={collisionDetection}
			// onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
            onDragStart={(e) => {
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
			<div
				className={`cv-page-document shadow-lg relative bg-white`}
				style={{
					width: "940px",
					height: "1300px",
					["--page-pad" as string]: pagePad,
					background:
						accent?.type === "leftBand" && colorSelected
							? `linear-gradient(to right, var(--${colorSelected}) ${bandStop}, #fff ${bandStop})`
							: "#fff",
				}}
			>
				<div className="absolute bottom-6 right-8 z-10">Test signature</div>
				<div ref={refTaille}>
					{/* Header full-bleed (au-dessus des 2 colonnes) */}
					{headerPlacement === "top" && (
						<button
                            type="button"
                            onClick={() => setSectionSelected("header")}
                            className={`w-full ${paddingDoc} pb-0`}
                        >
                            {HeaderComponent && <HeaderComponent />}
                        </button>
					)}

					<div className="sections-container w-full grid grid-cols-8 gap-6">
						{/* Colonne 0 — sidebar gauche */}
						<ColumnDropZone 
                            column={0} 
                            className={`col-span-3 min-h-[4rem] ${
                                sidebarSide === "right" ? "order-2" : "order-1"
                            } ${paddingDoc}`}
							fg={columnFg}
                            style={{
                                backgroundColor: cssToken ? `var(--${cssToken})` : undefined,
                            }}
                        >
                            <>
                            {headerPlacement === "sidebar" && (
                                <button
                                    type="button"
                                    onClick={() => setSectionSelected("header")}
                                    className="w-full"
                                >
                                    {HeaderComponent && <HeaderComponent />}
                                </button>
                            )}
							<SortableContext
								items={left.map((item) => item.id)}
								strategy={verticalListSortingStrategy}
							>
								{left.map((item) => (
									// biome-ignore lint/a11y/noStaticElementInteractions: wrapper section
									// biome-ignore lint/a11y/useKeyWithClickEvents: sélection section
									<div
										key={item.id}
										className="sections-container-left"
										onClick={() => setSectionSelected(item.id)}
									>
										<SectionSortableContext
											item={item}
											deleteSection={deleteSection}
											sectionMenu={item.sectionMenu}
										/>
									</div>
								))}
							</SortableContext>
                            </>
						</ColumnDropZone>

						{/* Colonne 1 — main */}
						<ColumnDropZone column={1} className={`col-span-5 min-h-[4rem] ${
                            sidebarSide === "right" ? "order-1 pr-0" : "order-2 pl-0"
                        } ${paddingDoc}`}>
							<SortableContext
								items={right.map((item) => item.id)}
								strategy={verticalListSortingStrategy}
							>
								{right.map((item) => (
									// biome-ignore lint/a11y/noStaticElementInteractions: wrapper section
									// biome-ignore lint/a11y/useKeyWithClickEvents: sélection section
									<div
										key={item.id}
										className="sections-container-right"
										onClick={() => setSectionSelected(item.id)}
									>
										<SectionSortableContext
											item={item}
											deleteSection={deleteSection}
											sectionMenu={item.sectionMenu}
										/>
									</div>
								))}
							</SortableContext>
						</ColumnDropZone>
					</div>
				</div>
			</div>
            <DragOverlay>
                {activeItem ? (
                    <div className="opacity-90 bg-white shadow-lg">
                        {/* titre ou mini preview — pas forcément tout le SectionXxx */}
                        {/* {activeItem.id.replace("section-", "")} */}
                        <activeItem.content />
                    </div>
                ) : null}
            </DragOverlay>
		</DndContext>
    );
}