export const COL_CLASS = {
	1: "grid-cols-1",
	2: "grid-cols-2",
	3: "grid-cols-3",
	4: "grid-cols-4",
} as const;

export const ITEM_OPTIONS = {
	1: [2, 3, 4],
	2: [1, 2],
	3: [1], // pas de radios, forcé
} as const;

export function clampItemColumns(
	groupCols: 1 | 2 | 3,
	itemCols: number | undefined,
): 1 | 2 | 3 | 4 {
	const allowed = ITEM_OPTIONS[groupCols];
	const current = Number(itemCols);
	if (allowed.includes(current as never)) return current as 1 | 2 | 3 | 4;
	return allowed.at(-1) ?? 1; // parent 2 → 2 ; parent 3 → 1
}
