/** Helper UI : premium sans unlock → badge / blocage download (pas création). */
export function isTemplateLocked(
	template: { id: string; isPremium: boolean },
	unlockedIds: ReadonlySet<string>,
): boolean {
	return template.isPremium && !unlockedIds.has(template.id);
}
