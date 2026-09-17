import { ChangePaddingDocument } from "@/features/cv-editor/utils/utilsCv/marge";
import { DndContext } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { HeaderRegister } from "../../template/register/header/HeaderRegister";
import { useCreateCvContext } from "../../context/CreateCvContext";
import { SectionSortableContext } from "../shared/SectionSortableContext";
import type { ItemGeneralProps } from "@utils/type";
import { useCvSectionItems } from "../shared/useCvSectionItems";
import { useCvPageDnd } from "../shared/useCvPageDnd";
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color";
import { CvSignature } from "../../brand/CvSignature";

export interface OneColumnModelProps {
	deleteSection: (item: ItemGeneralProps) => void;
}
export const OneColumnModel = ({ deleteSection }: OneColumnModelProps) => {
	const paddingDoc = ChangePaddingDocument();
	const refTaille = useRef<HTMLDivElement>(null);
	const { setSectionSelected } = useCreateCvContext();
	const { watch } = useFormContext();

	const itemUse = useCvSectionItems(0); // colonne unique
	const { sensors, handleDragEnd, handleDragOver, collisionDetection } =
		useCvPageDnd([itemUse]);

	const primaryColor = GetPrimaryColor() ?? "white";
	const accent = watch("layoutGeneral.layout.pageAccent");
	const shade = accent?.shade;
	const marge = (watch("layoutGeneral.layout.marge") ?? "md") as
		| "sm"
		| "md"
		| "lg";
	const pagePad = { sm: "2rem", md: "3rem", lg: "4rem" }[marge];
	const [colorSelected, setColorSelected] = useState<string | null>(null);
	const bandStop =
		"calc(var(--page-pad) + (100% - 2 * var(--page-pad)) * 0.2 + 0.5rem)";

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
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
		>
			<div
				className={`cv-page-document shadow-lg relative bg-white ${paddingDoc}`}
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
				<CvSignature />
				<SortableContext
					items={itemUse.map((item) => item.id)}
					strategy={verticalListSortingStrategy}
				>
					<div ref={refTaille}>
						<button
							type="button"
							onClick={() => setSectionSelected("header")}
							className="w-full"
						>
							{HeaderComponent && <HeaderComponent />}
						</button>
						{itemUse
							?.sort((a, b) => a.order - b.order)
							.map((item) => {
								return (
									// biome-ignore lint/a11y/noStaticElementInteractions: <wrapper de section : enfants déjà interactifs (pas de <button> imbriqué)>
									// biome-ignore lint/a11y/useKeyWithClickEvents: <drop sur un élément interactif>
									<div
										key={item.id}
										className="sections-container w-full"
										onClick={() => setSectionSelected(item.id)}
									>
										<SectionSortableContext
											item={item}
											deleteSection={deleteSection}
											sectionMenu={item.sectionMenu}
										/>
									</div>
								);
							})}
					</div>
				</SortableContext>
			</div>
		</DndContext>
	);
};
