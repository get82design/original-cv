import { MdDelete, MdDragIndicator } from "react-icons/md";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { useColumnFg } from "@/features/cv-editor/component/kit-dnd/shared/ColumnFgContext";
import { CV_TOOLBAR_ICON_SIZE, cvToolbarIconBtnClass } from "./ToolbarOptionsButton";

type SectionItemShellProps = {
	clientKey: string;
	/** ex: "language" | "experience" | "socialMedia" — un seul token partout */
	sectionId: string;
	containerId: string; // pour dnd-kit data
	path: string; // FieldNameX.content
	sortableData?: Record<string, unknown>; // skillsPath, etc.
	itemSelected: string;
	setItemSelected: (key: string) => void;
	/** match selectModifInput — défaut = sectionId */
	modifMatch?: string;
	onDelete?: () => void;
	showListLigne?: boolean;
	listLigne?: React.ReactNode; // ou laisser le parent wrap
	toolbarExtra?: React.ReactNode; // "options"
	/** à gauche du contenu — ex. CommonListLigne */
	leading?: React.ReactNode;
	/** className du wrapper externe (flex gap-2 pour experience/skill) */
	className?: string;
	sortableType?: "card" | "subcard";
	children: React.ReactNode;
};

export function SectionItemShell({
	clientKey,
	sectionId,
	containerId,
	path,
	sortableData,
	itemSelected,
	setItemSelected,
	modifMatch = sectionId,
	onDelete,
	toolbarExtra,
	leading,
	className,
	children,
	sortableType = "card",
}: SectionItemShellProps) {
	const { selectModifInput, sectionSelected, setSectionSelected } = useCreateCvContext();
	const columnFg = useColumnFg();
	// Sidebar sombre (fg white) : pas de bg clair qui casse le contraste du texte
	const darkColumn = columnFg === "white";

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: clientKey,
		data: { type: sortableType, containerId, path, ...sortableData },
	});

	const isItemSelected = clientKey === itemSelected;
	const sectionKey = `section-${sectionId}`;
	const showToolbar = selectModifInput.includes(modifMatch) && isItemSelected;
	const highlight = isItemSelected && sectionSelected.includes(sectionId);

	const highlightClass = highlight
		? darkColumn
			? "rounded-lg ring-2 ring-white/50"
			: "bg-gray-100 rounded-lg"
		: "";
	const toolbarBgClass =
		showToolbar && sectionSelected.includes(sectionId)
			? darkColumn
				? "rounded-lg ring-2 ring-white/50"
				: "rounded-lg bg-gray-100"
			: "";

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.5 : 1,
			}}
			className={`section-card relative ${className} ${highlightClass}`}
		>
			{leading}
			<div
				className={`relative w-full ${toolbarBgClass}`}
				onClick={(e) => {
					e.stopPropagation();
					setItemSelected(clientKey);
					setSectionSelected(sectionKey);
				}}
			>
				{showToolbar && (
					<div className="absolute w-auto right-0 -top-8 flex justify-center z-20">
						<div className="rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm flex items-center">
							<div
								className={cvToolbarIconBtnClass}
								title="Déplacer"
								aria-label="Déplacer"
								{...listeners}
								{...attributes}
							>
								<MdDragIndicator size={CV_TOOLBAR_ICON_SIZE} className="cursor-move" />
							</div>
							{toolbarExtra ? (
								<>
									<span className="w-px self-stretch bg-gray-200 dark:bg-gray-600" />
									{toolbarExtra}
								</>
							) : null}
							{onDelete && (
								<>
									<span className="w-px self-stretch bg-gray-200 dark:bg-gray-600" />
									<button
										type="button"
										className={cvToolbarIconBtnClass}
										title="Supprimer"
										aria-label="Supprimer"
										onClick={(e) => {
											e.stopPropagation();
											onDelete();
										}}
									>
										<MdDelete size={CV_TOOLBAR_ICON_SIZE} style={{ color: "var(--red-500)" }} />
									</button>
								</>
							)}
						</div>
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
