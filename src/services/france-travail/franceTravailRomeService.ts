import { TooManyRequestsError, ValidationError } from "../errors";
import { franceTravailGetJson } from "./franceTravailClient";
import {
	mapRomeApisToFicheDto,
	mapSearchHitToDto,
	romeAppellationSearchResponseSchema,
	romeCodeSchema,
	romeFicheRawSchema,
	romeMetierRawSchema,
	type RomeAppellationHitDto,
	type RomeFicheDto,
} from "../schemas/romeFiche.schema";

const SEARCH_CHAMPS = "libelle,code,metier(libelle,code)";
const FICHE_CACHE_TTL_MS = 60 * 60 * 1000;
const RETRY_DELAY_MS = 1100;

type FicheCacheEntry = {
	dto: RomeFicheDto;
	expiresAtMs: number;
};

const ficheCache = new Map<string, FicheCacheEntry>();

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJsonWith429Retry<T>(
	run: () => Promise<T>,
	options: { fetchImpl?: typeof fetch; skipDelay?: boolean } = {},
): Promise<T> {
	try {
		return await run();
	} catch (err) {
		if (!(err instanceof TooManyRequestsError)) throw err;
		if (!options.skipDelay) {
			await sleep(RETRY_DELAY_MS);
		}
		return await run();
	}
}

class FranceTravailRomeService {
	/**
	 * Autocomplete appellations ROME (début de mot / texte libre).
	 */
	async searchAppellations(input: {
		q: string;
		limit?: number;
		fetchImpl?: typeof fetch;
	}): Promise<{ total: number; hits: RomeAppellationHitDto[] }> {
		const q = input.q.trim();
		if (q.length < 2) {
			throw new ValidationError("Saisis au moins 2 caractères pour rechercher un métier.");
		}

		const raw = await getJsonWith429Retry(
			() =>
				franceTravailGetJson<unknown>({
					path: "/rome-metiers/v1/metiers/appellation/requete",
					scopeKind: "metiers",
					query: {
						q,
						champs: SEARCH_CHAMPS,
					},
					...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
				}),
			{ skipDelay: process.env.VITEST === "true" },
		);

		const parsed = romeAppellationSearchResponseSchema.safeParse(raw);
		if (!parsed.success) {
			throw new ValidationError("Réponse France Travail (appellations) invalide.", parsed.error.issues);
		}

		const hits: RomeAppellationHitDto[] = [];
		for (const hit of parsed.data.resultats) {
			const dto = mapSearchHitToDto(hit);
			if (dto) hits.push(dto);
		}

		const limit = input.limit ?? 15;
		const sliced = hits.slice(0, limit);
		return {
			total: parsed.data.totalResultats ?? hits.length,
			hits: sliced,
		};
	}

	/**
	 * Fiche métier fusionnée (API Métiers + API Fiches).
	 */
	async getFicheByCodeRome(
		codeRomeInput: string,
		options: { fetchImpl?: typeof fetch; bypassCache?: boolean; nowMs?: number } = {},
	): Promise<RomeFicheDto> {
		const codeParse = romeCodeSchema.safeParse(codeRomeInput);
		if (!codeParse.success) {
			throw new ValidationError("Code ROME invalide.");
		}
		const codeRome = codeParse.data.toUpperCase();
		const now = options.nowMs ?? Date.now();

		if (!options.bypassCache) {
			const cached = ficheCache.get(codeRome);
			if (cached && cached.expiresAtMs > now) {
				return cached.dto;
			}
		}

		const skipDelay = process.env.VITEST === "true";

		const fetchMetier = () =>
			franceTravailGetJson<unknown>({
				path: `/rome-metiers/v1/metiers/metier/${encodeURIComponent(codeRome)}`,
				scopeKind: "metiers",
				...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {}),
			});

		const fetchFiche = () =>
			franceTravailGetJson<unknown>({
				path: `/rome-fiches-metiers/v1/fiches-rome/fiche-metier/${encodeURIComponent(codeRome)}`,
				scopeKind: "fiches",
				...(options.fetchImpl ? { fetchImpl: options.fetchImpl } : {}),
			});

		let metierRaw: unknown;
		let ficheRaw: unknown;

		try {
			[metierRaw, ficheRaw] = await Promise.all([
				getJsonWith429Retry(fetchMetier, { skipDelay }),
				getJsonWith429Retry(fetchFiche, { skipDelay }),
			]);
		} catch (err) {
			if (!(err instanceof TooManyRequestsError)) throw err;
			// Fallback séquentiel si le parallélisme tombe encore en 429
			if (!skipDelay) await sleep(RETRY_DELAY_MS);
			metierRaw = await getJsonWith429Retry(fetchMetier, { skipDelay });
			if (!skipDelay) await sleep(RETRY_DELAY_MS);
			ficheRaw = await getJsonWith429Retry(fetchFiche, { skipDelay });
		}

		const metierParsed = romeMetierRawSchema.safeParse(metierRaw);
		const ficheParsed = romeFicheRawSchema.safeParse(ficheRaw);
		if (!metierParsed.success || !ficheParsed.success) {
			throw new ValidationError("Réponse France Travail (fiche métier) invalide.");
		}

		const dto = mapRomeApisToFicheDto(metierParsed.data, ficheParsed.data, codeRome);
		ficheCache.set(codeRome, { dto, expiresAtMs: now + FICHE_CACHE_TTL_MS });
		return dto;
	}
}

export const franceTravailRomeService = new FranceTravailRomeService();

/** Réservé aux tests. */
export function clearRomeFicheCache(): void {
	ficheCache.clear();
}
