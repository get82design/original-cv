import { useDroppable } from "@dnd-kit/core";
import type { CSSProperties, ReactNode } from "react";
import { ColumnFgProvider, type ColumnFg } from "./ColumnFgContext";

interface ColumnDropZoneProps {
	column: number;
	/** Index de page A4 — rend l’id droppable unique (multi-pages). */
	pageIndex?: number;
	className?: string;
	style?: CSSProperties;
	/** Si défini, les inputs de cette colonne héritent de cette couleur (via useInputCvColor). */
	fg?: ColumnFg | null;
	children: ReactNode;
}

/** Zone droppable d'une colonne (y compris vide) pour le DnD de sections. */
export const ColumnDropZone = ({
	column,
	pageIndex = 0,
	className,
	style,
	fg = null,
	children,
}: ColumnDropZoneProps) => {
	const { setNodeRef, isOver } = useDroppable({
		id: `column-${column}-p${pageIndex}`,
		data: { type: "column", column },
	});

	return (
		<div
			ref={setNodeRef}
			className={`${className ?? ""} ${isOver ? "ring-2 ring-gray-300 rounded-lg" : ""}`}
			// minHeight (pas height fixe) : laisse le contenu définir la taille pour la mesure / pagination
			style={{ minHeight: "100%", ...style }}
		>
			<ColumnFgProvider fg={fg}>{children}</ColumnFgProvider>
		</div>
	);
};
