import { ValidationError, AuthenticationError } from "../errors";

const TOKEN_URL =
	"https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";

/** Scopes ROME Métiers (autocomplete + détail métier). */
export const ROME_METIERS_SCOPE = "api_rome-metiersv1 nomenclatureRome";

/** Scopes ROME Fiches métiers (compétences / savoirs). */
export const ROME_FICHES_SCOPE = "api_rome-fiches-metiersv1 nomenclatureRome";

/** Les deux scopes combinés (1 token si les 2 API sont souscrites). */
export const ROME_COMBINED_SCOPE = `${ROME_METIERS_SCOPE} ${ROME_FICHES_SCOPE}`;

type CachedToken = {
	accessToken: string;
	/** Epoch ms à partir duquel on considère le token expiré. */
	expiresAtMs: number;
};

const tokenCache = new Map<string, CachedToken>();

/** Marge avant expiry pour renouveler un peu plus tôt. */
const EXPIRY_MARGIN_MS = 60_000;

export type FranceTravailCredentials = {
	clientId: string;
	clientSecret: string;
};

export function readFranceTravailCredentialsFromEnv(): FranceTravailCredentials | null {
	const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID?.trim();
	const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET?.trim();
	if (!clientId || !clientSecret) return null;
	return { clientId, clientSecret };
}

export function requireFranceTravailCredentials(): FranceTravailCredentials {
	const creds = readFranceTravailCredentialsFromEnv();
	if (!creds) {
		throw new ValidationError(
			"France Travail n’est pas configuré (FRANCE_TRAVAIL_CLIENT_ID / FRANCE_TRAVAIL_CLIENT_SECRET).",
		);
	}
	return creds;
}

type TokenResponse = {
	access_token?: string;
	token_type?: string;
	expires_in?: number;
	error?: string;
	error_description?: string;
};

/**
 * Obtient un access_token OAuth2 (client_credentials), mis en cache par scope.
 * Injectable `fetchImpl` pour les tests.
 */
export async function getFranceTravailAccessToken(
	scope: string,
	options: {
		credentials?: FranceTravailCredentials;
		fetchImpl?: typeof fetch;
		/** Force un nouvel appel même si le cache est valide. */
		forceRefresh?: boolean;
		nowMs?: number;
	} = {},
): Promise<string> {
	const now = options.nowMs ?? Date.now();
	const cached = tokenCache.get(scope);
	if (!options.forceRefresh && cached && cached.expiresAtMs > now) {
		return cached.accessToken;
	}

	const creds = options.credentials ?? requireFranceTravailCredentials();
	const fetchImpl = options.fetchImpl ?? fetch;

	const body = new URLSearchParams({
		grant_type: "client_credentials",
		client_id: creds.clientId,
		client_secret: creds.clientSecret,
		scope,
	});

	const res = await fetchImpl(TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body,
	});

	let json: TokenResponse;
	try {
		json = (await res.json()) as TokenResponse;
	} catch {
		throw new AuthenticationError(
			"Impossible d’obtenir un jeton France Travail (réponse invalide).",
		);
	}

	if (!res.ok || !json.access_token) {
		const detail = json.error_description ?? json.error ?? `HTTP ${res.status}`;
		throw new AuthenticationError(
			`Authentification France Travail échouée : ${detail}`,
		);
	}

	const expiresInSec = typeof json.expires_in === "number" ? json.expires_in : 1500;
	tokenCache.set(scope, {
		accessToken: json.access_token,
		expiresAtMs: now + Math.max(0, expiresInSec * 1000 - EXPIRY_MARGIN_MS),
	});

	return json.access_token;
}

/** Réservé aux tests — vide le cache token. */
export function clearFranceTravailTokenCache(): void {
	tokenCache.clear();
}
