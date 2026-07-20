export function compactOrder<T>(items: T[]) {
	return items.map((item, index) => ({
		item,
		order: index + 1,
	}));
}
