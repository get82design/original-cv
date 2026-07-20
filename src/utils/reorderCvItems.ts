export function reorderItems<T extends { id: string }>(
	items: T[],
	id: string,
	newOrder: number,
) {
	if (newOrder < 1 || newOrder > items.length) {
		throw new Error("Invalid order");
	}

	const oldIndex = items.findIndex((item) => item.id === id);

	if (oldIndex === -1) {
		throw new Error("Item not found");
	}

	const [movedItem] = items.splice(oldIndex, 1);

	if (!movedItem) {
		throw new Error("Item not found");
	}

	items.splice(newOrder - 1, 0, movedItem);

	return items.map((item, index) => ({
		item,
		order: index + 1,
	}));
}
