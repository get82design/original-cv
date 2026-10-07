/**
 * Largeur inline d’un InputTextCv.
 * Un nouveau CV laisse nom/prénom à `undefined` : sans ça, la largeur CSS
 * devient `undefinedch` (ignorée) et l’input retombe sur ~20 caractères,
 * assez pour pousser la photo hors du header.
 */
export function cvInputTextWidth(
	value: unknown,
	placeholder: string | undefined,
	forceWidthFull: boolean,
): string {
	if (forceWidthFull) return "100%";
	const text = typeof value === "string" ? value : "";
	if (text.length === 0 && placeholder) return `${placeholder.length}ch`;
	return `${text.length}ch`;
}
