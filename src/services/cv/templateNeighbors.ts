export type TemplateNavItem = {
	slug: string;
	name: string;
};

/**
 * Voisins précédent / suivant dans le catalogue (ordre sortOrder puis nom).
 */
export function resolveTemplateNeighbors(
	ordered: TemplateNavItem[],
	currentSlug: string,
): { prev: TemplateNavItem | null; next: TemplateNavItem | null } {
	const index = ordered.findIndex((t) => t.slug === currentSlug);
	if (index < 0) {
		return { prev: null, next: null };
	}
	return {
		prev: index > 0 ? (ordered[index - 1] ?? null) : null,
		next: index < ordered.length - 1 ? (ordered[index + 1] ?? null) : null,
	};
}
