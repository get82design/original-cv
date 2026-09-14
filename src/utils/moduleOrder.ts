import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";

/**
 * Renumérote les modules par colonne :
 * - actifs : 1, 2, 3… (ordre relatif conservé)
 * - inactifs : à la suite (n+1…) pour respecter @@unique([cvId, column, order])
 */
export function compactActiveOrders(
	modules: TemplateModule[],
): TemplateModule[] {
	const columns = [
		...new Set(modules.map((m) => m.column ?? 0)),
	];

	const orderByType = new Map<string, number>();

	for (const col of columns) {
		const inCol = modules.filter((m) => (m.column ?? 0) === col);

		const activeSorted = inCol
			.filter((m) => m.isActive)
			.slice()
			.sort((a, b) => a.order - b.order);

		const inactiveSorted = inCol
			.filter((m) => !m.isActive)
			.slice()
			.sort((a, b) => a.order - b.order);

		activeSorted.forEach((m, i) => {
			orderByType.set(m.type, i + 1);
		});
		inactiveSorted.forEach((m, i) => {
			orderByType.set(m.type, activeSorted.length + i + 1);
		});
	}

	return modules.map((m) => ({
		...m,
		order: orderByType.get(m.type) ?? m.order,
	}));
}

export function nextActiveOrder(modules: TemplateModule[]): number {
	const active = modules.filter((m) => m.isActive);
	if (active.length === 0) return 1;
	return Math.max(...active.map((m) => m.order)) + 1;
}

export function nextActiveOrderInColumn(
	modules: TemplateModule[],
	column: number,
): number {
	const active = modules.filter(
		(m) => m.isActive && (m.column ?? 0) === column,
	);
	if (active.length === 0) return 1;
	return Math.max(...active.map((m) => m.order)) + 1;
}
