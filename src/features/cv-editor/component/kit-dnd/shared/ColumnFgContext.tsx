import { createContext, useContext, type ReactNode } from "react";

export type ColumnFg = "white" | "black";

const ColumnFgContext = createContext<ColumnFg | null>(null);

export function ColumnFgProvider({
	fg,
	children,
}: {
	fg: ColumnFg | null;
	children: ReactNode;
}) {
	return (
		<ColumnFgContext.Provider value={fg}>{children}</ColumnFgContext.Provider>
	);
}

/** Fg forcé par la colonne (sidebar), ou null hors thème colonne. */
export function useColumnFg(): ColumnFg | null {
	return useContext(ColumnFgContext);
}

/** Résout sidebarTheme.fg (+ shade) en white/black, ou null si pas de thème. */
export function resolveSidebarFg(
	fg: "auto" | "black" | "white" | undefined,
	shadeBgColor?: string,
): ColumnFg | null {
	if (fg === "white" || fg === "black") return fg;
	if (fg === "auto") {
		const n = Number(shadeBgColor);
		if (!Number.isNaN(n) && n <= -500) return "white";
		return "black";
	}
	return null;
}
