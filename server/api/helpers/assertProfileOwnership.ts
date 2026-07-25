import { ForbiddenError } from "../../../src/services/errors";

/** Vérifie que le user cible est bien celui de la session. */
export function assertProfileOwnership(
	targetUserId: string,
	sessionUserId: string,
) {
	if (targetUserId !== sessionUserId) {
		throw new ForbiddenError("FORBIDDEN", "You cannot access this Profile");
	}
}
