import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCreateCvContext } from "../../context/CreateCvContext";
import { MdDelete, MdOutlineOpenWith } from "react-icons/md";
import type { ItemGeneralProps } from "@utils/type";

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
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: item.id, // 'section-education'
		data: {
			type: "section",
		},
	});

	const {
		// setListItemsUse,
		// setListItemsNoUse,
		// listItemsUse,
		sectionSelected,
		setSectionSelected,
	} = useCreateCvContext();

	const ContentComponent = item.content;

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isSexionSelected = item.id === sectionSelected ? true : false;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`section-card relative ${
				// isSexionSelected ? "bg-gray-50 rounded-lg" : ""
				isSexionSelected ? "rounded-lg ring-2 ring-gray-300" : ""
			}`}
		>
			{/* Poignée de déplacement de la section */}
			{isSexionSelected ? (
				<div className="absolute bg-white dark:bg-gray-800 w-auto left-0 -top-6 rounded-l-lg flex justify-center items-center border-l-2 border-b-2 border-t-2 border-gray-100">
					<div className="p-2" {...attributes} {...listeners}>
						<MdOutlineOpenWith
							style={{ width: "20px", height: "20px" }}
							className="cursor-move"
						/>
					</div>
					{sectionMenu}
					<button
						type="button"
						className="p-2 cursor-pointer hover:bg-gray-100"
						onClick={() => deleteSection(item)}
					>
						<MdDelete
							style={{
								width: "20px",
								height: "20px",
								color: "var(--red-500)",
							}}
						/>
					</button>
				</div>
			) : null}
			{ContentComponent && <ContentComponent />}
		</div>
	);
};
