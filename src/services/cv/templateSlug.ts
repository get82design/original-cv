/**
 * Slug URL catalogue à partir du nom produit (ex. « Berlin » → « berlin »).
 */
export function slugifyTemplateName(name: string): string {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
