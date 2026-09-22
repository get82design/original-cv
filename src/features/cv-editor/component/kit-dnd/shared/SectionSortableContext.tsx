import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCreateCvContext } from "../../context/CreateCvContext";
import { MdCloudDownload, MdDelete, MdDragIndicator } from "react-icons/md";
import type { ItemGeneralProps } from "@utils/type";
import { useState } from "react";
import { DialogDataSectionFromProfile } from "../../dialog/dataFromProfile/DialogDataSectionFromProfile";
import {
	CV_TOOLBAR_ICON_SIZE,
	cvToolbarIconBtnClass,
} from "../../template/components/common-compo/section/ToolbarOptionsButton";

interface SectionSortableContextProps {
	item: ItemGeneralProps;
	deleteSection: (item: ItemGeneralProps) => void;
	sectionMenu?: React.ReactNode;
}
export const SectionSortableContext = ({
	item,
	deleteSection,
	sectionMenu,
}: SectionSortableContextProps) => {
	const [visibleDialogDataSectionFromProfile, setVisibleDialogDataSectionFromProfile] =
		useState(false);
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: item.id,
		data: {
			type: "section",
			column: item.column,
		},
	});

	const { sectionSelected } = useCreateCvContext();

	const ContentComponent = item.content;

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isSectionSelected = item.id === sectionSelected;

	return (
		<div ref={setNodeRef} style={style} className="section-card relative">
			{isSectionSelected ? (
				<div className="absolute z-100 bg-white dark:bg-gray-800 w-auto left-0 -top-7 rounded-md flex gap-0 items-center border border-gray-200 dark:border-gray-600 shadow-sm">
					<div
						className={cvToolbarIconBtnClass}
						title="Déplacer"
						aria-label="Déplacer"
						{...attributes}
						{...listeners}
					>
						<MdDragIndicator size={CV_TOOLBAR_ICON_SIZE} className="cursor-move" />
					</div>
					{sectionMenu ? (
						<>
							<span className="w-px self-stretch bg-gray-200 dark:bg-gray-600" />
							{sectionMenu}
						</>
					) : null}
					<span className="w-px self-stretch bg-gray-200 dark:bg-gray-600" />
					<button
						type="button"
						className={cvToolbarIconBtnClass}
						title="Récupérer les données"
						aria-label="Récupérer les données"
						onClick={() => setVisibleDialogDataSectionFromProfile(true)}
					>
						<MdCloudDownload size={CV_TOOLBAR_ICON_SIZE} />
					</button>
					<span className="w-px self-stretch bg-gray-200 dark:bg-gray-600" />
					<button
						type="button"
						className={cvToolbarIconBtnClass}
						title="Supprimer"
						aria-label="Supprimer"
						onClick={() => deleteSection(item)}
					>
						<MdDelete size={CV_TOOLBAR_ICON_SIZE} style={{ color: "var(--red-500)" }} />
					</button>
				</div>
			) : null}
			{ContentComponent && <ContentComponent />}
			{visibleDialogDataSectionFromProfile && (
				<DialogDataSectionFromProfile
					visible={visibleDialogDataSectionFromProfile}
					onHide={() => setVisibleDialogDataSectionFromProfile(false)}
					sectionSelected={sectionSelected}
				/>
			)}
		</div>
	);
};
