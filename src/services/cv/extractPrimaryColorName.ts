/**
 * Extrait le nom de couleur primaire depuis layoutGeneral ou defaultStyles template.
 * Chemin : *.primaryColor.name
 */
export function extractPrimaryColorName(source: unknown): string | null {
	if (!source || typeof source !== "object") return null;

	const root = source as Record<string, unknown>;
	const defaultStyles =
		root.defaultStyles && typeof root.defaultStyles === "object"
			? (root.defaultStyles as Record<string, unknown>)
			: root;

	const primaryColor = defaultStyles.primaryColor;
	if (!primaryColor || typeof primaryColor !== "object") return null;

	const name = (primaryColor as { name?: unknown }).name;
	if (typeof name !== "string") return null;
	const trimmed = name.trim();
	return trimmed.length > 0 ? trimmed : null;
}
