import type { DrivingLicense } from "@/services/schemas/enums";

/** Ligne d’affichage header : « Permis B, BE · Véhiculé ». Vide si rien. */
export function formatDrivingLicenseLine(
	licenses: readonly DrivingLicense[] | null | undefined,
	hasVehicle: boolean | null | undefined,
): string {
	const parts: string[] = [];
	const list = (licenses ?? []).filter(Boolean);
	if (list.length > 0) {
		parts.push(`Permis ${list.join(", ")}`);
	}
	if (hasVehicle) {
		parts.push("Véhiculé");
	}
	return parts.join(" · ");
}

export function hasDrivingLicenseInfo(
	licenses: readonly DrivingLicense[] | null | undefined,
	hasVehicle: boolean | null | undefined,
): boolean {
	return (licenses?.length ?? 0) > 0 || Boolean(hasVehicle);
}
