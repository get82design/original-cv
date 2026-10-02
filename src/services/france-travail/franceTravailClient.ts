import { AuthenticationError, TooManyRequestsError, ValidationError } from "../errors";
import {
	getFranceTravailAccessToken,
	ROME_COMBINED_SCOPE,
	ROME_FICHES_SCOPE,
	ROME_METIERS_SCOPE,
} from "./franceTravailAuth";

export const FRANCE_TRAVAIL_API_BASE = "https://api.francetravail.io/partenaire";

export type FranceTravailScopeKind = "metiers" | "fiches" | "combined";

const SCOPE_BY_KIND: Record<FranceTravailScopeKind, string> = {
	metiers: ROME_METIERS_SCOPE,
	fiches: ROME_FICHES_SCOPE,
	combined: ROME_COMBINED_SCOPE,
};

export type FranceTravailGetOptions = {
	/** Chemin relatif à la base partenaire, ex. `/rome-metiers/v1/metiers/metier/M1805` */
	path: string;
	query?: Record<string, string | number | undefined>;
	scopeKind?: FranceTravailScopeKind;
	fetchImpl?: typeof fetch;
	accessToken?: string;
};

function buildUrl(path: string, query?: FranceTravailGetOptions["query"]): string {
	const url = new URL(
		path.startsWith("http") ? path : `${FRANCE_TRAVAIL_API_BASE}${path.startsWith("/") ? path : `/${path}`}`,
	);
	if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value === undefined) continue;
			url.searchParams.set(key, String(value));
		}
	}
	return url.toString();
}

/**
 * GET authentifié vers une API partenaire France Travail.
 * Mappe 429 → TooManyRequestsError, 401/403 → AuthenticationError.
 */
export async function franceTravailGetJson<T>(
	options: FranceTravailGetOptions,
): Promise<T> {
	const scopeKind = options.scopeKind ?? "combined";
	const fetchImpl = options.fetchImpl ?? fetch;
	const token =
		options.accessToken ??
		(await getFranceTravailAccessToken(SCOPE_BY_KIND[scopeKind], { fetchImpl }));

	const url = buildUrl(options.path, options.query);
	const res = await fetchImpl(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
		},
	});

	if (res.status === 429) {
		const retryAfter = res.headers.get("Retry-After");
		throw new TooManyRequestsError(
			"France Travail limite temporairement les requêtes. Réessaie dans une seconde.",
			retryAfter ? { retryAfter } : undefined,
		);
	}

	if (res.status === 401 || res.status === 403) {
		let detail = `HTTP ${res.status}`;
		try {
			const body = (await res.json()) as { message?: string; error?: string };
			detail = body.message ?? body.error ?? detail;
		} catch {
			/* ignore */
		}
		throw new AuthenticationError(
			`Accès France Travail refusé (${detail}). Vérifie les souscriptions API ROME.`,
		);
	}

	if (res.status === 404) {
		throw new ValidationError("Ressource ROME introuvable auprès de France Travail.");
	}

	if (!res.ok) {
		let detail = `HTTP ${res.status}`;
		try {
			const body = (await res.json()) as { message?: string; error?: string };
			detail = body.message ?? body.error ?? detail;
		} catch {
			/* ignore */
		}
		throw new ValidationError(`Erreur France Travail : ${detail}`);
	}

	if (res.status === 204) {
		throw new ValidationError("Réponse France Travail vide.");
	}

	return (await res.json()) as T;
}

export { SCOPE_BY_KIND };
