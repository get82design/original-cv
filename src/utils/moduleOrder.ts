import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";

/** Renumérote uniquement les modules actifs : 1, 2, 3… (ordre stable actuel) */
export function compactActiveOrders(
	modules: TemplateModule[],
): TemplateModule[] {
	const activeSorted = modules
		.filter((m) => m.isActive)
		.slice()
		.sort((a, b) => a.order - b.order);

	const orderByType = new Map(
		activeSorted.map((m, i) => [m.type, i + 1] as const),
	);

	return modules.map((m) => {
		const nextOrder = orderByType.get(m.type);
		return m.isActive && nextOrder != null ? { ...m, order: nextOrder } : m;
	});
}

export function nextActiveOrder(modules: TemplateModule[]): number {
	const active = modules.filter((m) => m.isActive);
	if (active.length === 0) return 1;
	return Math.max(...active.map((m) => m.order)) + 1;
}

// !Plus tard (2 colonnes)
// Même logique, scopée :

// nextActiveOrder(modules.filter((m) => m.column === targetColumn));
// // add → { isActive: true, column: 0, order: newOrder }

// compactActiveOrders(
//   modules.filter((m) => m.column === deletedColumn),
//   // puis merger avec les autres colonnes
// );
