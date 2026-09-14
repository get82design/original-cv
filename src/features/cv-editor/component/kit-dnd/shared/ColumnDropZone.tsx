import { useDroppable } from "@dnd-kit/core";
import type { CSSProperties, ReactNode } from "react";
import { ColumnFgProvider, type ColumnFg } from "./ColumnFgContext";

interface ColumnDropZoneProps {
	column: number;
	className?: string;
	style?: CSSProperties;
	/** Si défini, les inputs de cette colonne héritent de cette couleur (via useInputCvColor). */
	fg?: ColumnFg | null;
	children: ReactNode;
}

/** Zone droppable d'une colonne (y compris vide) pour le DnD de sections. */
export const ColumnDropZone = ({
	column,
	className,
	style,
	fg = null,
	children,
}: ColumnDropZoneProps) => {
	const { setNodeRef, isOver } = useDroppable({
		id: `column-${column}`,
		data: { type: "column", column },
	});

	return (
		<div
			ref={setNodeRef}
			className={`${className ?? ""} ${isOver ? "ring-2 ring-gray-300 rounded-lg" : ""}`}
			style={{ height: "1300px", ...style }}
		>
			<ColumnFgProvider fg={fg}>{children}</ColumnFgProvider>
		</div>
	);
};
