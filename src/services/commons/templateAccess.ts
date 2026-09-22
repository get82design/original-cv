/**
 * Règles catalogue / accès templates.
 *
 * - Free / Premium : création & édition autorisées si le modèle est actif.
 * - Premium non débloqué : bloqué au **téléchargement** uniquement.
 * - Premium → free : les unlocks restent en base mais ne sont plus exigés.
 * - Inactif : hors catalogue ; on ne peut pas créer / changer vers ce template.
 *   Un CV déjà lié à un template inactif reste consultable / éditable.
 */

export type TemplateAccessFields = {
	isActive: boolean;
	isPremium: boolean;
};

/** Cadeaux à l’unlock / achat (contrat JSON sur CVTemplate.unlockGifts). */
export type TemplateUnlockGifts = {
	downloadCredits?: number | undefined;
	freeDownloads?: number | undefined;
};

export type TemplateAccessDenial = "INACTIVE" | "PREMIUM_LOCKED";

export function isListedInCatalog(template: { isActive: boolean }): boolean {
	return template.isActive;
}

/**
 * Création CV / changement de template : seul l’actif compte.
 * Le premium se joue au download (`canDownloadTemplate`).
 */
export function canUseTemplate(
	template: TemplateAccessFields,
	_opts?: { hasUnlock?: boolean },
): boolean {
	return reasonCannotUseTemplate(template) === null;
}

export function reasonCannotUseTemplate(
	template: TemplateAccessFields,
	_opts?: { hasUnlock?: boolean },
): TemplateAccessDenial | null {
	if (!template.isActive) return "INACTIVE";
	return null;
}

/** Export PDF : premium nécessite UnlockedTemplate. */
export function canDownloadTemplate(
	template: TemplateAccessFields,
	opts: { hasUnlock: boolean },
): boolean {
	return reasonCannotDownloadTemplate(template, opts) === null;
}

export function reasonCannotDownloadTemplate(
	template: TemplateAccessFields,
	opts: { hasUnlock: boolean },
): TemplateAccessDenial | null {
	if (template.isPremium && !opts.hasUnlock) return "PREMIUM_LOCKED";
	return null;
}

/** Unlock manuel / achat : template doit être actif. Free autorisé (no-op métier). */
export function canUnlockTemplate(template: { isActive: boolean }): boolean {
	return template.isActive;
}

export function parseUnlockGifts(raw: unknown): TemplateUnlockGifts | null {
	if (raw == null) return null;
	if (typeof raw !== "object" || Array.isArray(raw)) return null;

	const obj = raw as Record<string, unknown>;
	const gifts: TemplateUnlockGifts = {};

	if (typeof obj.downloadCredits === "number" && obj.downloadCredits >= 0) {
		gifts.downloadCredits = Math.floor(obj.downloadCredits);
	}
	if (typeof obj.freeDownloads === "number" && obj.freeDownloads >= 0) {
		gifts.freeDownloads = Math.floor(obj.freeDownloads);
	}

	return Object.keys(gifts).length > 0 ? gifts : null;
}

export function denialMessage(reason: TemplateAccessDenial): string {
	switch (reason) {
		case "INACTIVE":
			return "Ce modèle n’est pas disponible";
		case "PREMIUM_LOCKED":
			return "Ce modèle premium n’est pas débloqué — débloquez-le pour télécharger";
	}
}
