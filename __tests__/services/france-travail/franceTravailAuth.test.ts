import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearFranceTravailTokenCache,
	getFranceTravailAccessToken,
	ROME_METIERS_SCOPE,
} from "../../../src/services/france-travail/franceTravailAuth";
import { AuthenticationError, ValidationError } from "../../../src/services/errors";

describe("franceTravailAuth", () => {
	beforeEach(() => {
		clearFranceTravailTokenCache();
		process.env.FRANCE_TRAVAIL_CLIENT_ID = "test-client-id";
		process.env.FRANCE_TRAVAIL_CLIENT_SECRET = "test-client-secret";
	});

	afterEach(() => {
		clearFranceTravailTokenCache();
		vi.restoreAllMocks();
	});

	it("demande un token et le met en cache jusqu’à expires_in - 60s", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				access_token: "tok-1",
				token_type: "Bearer",
				expires_in: 1500,
			}),
		});

		const t0 = 1_000_000;
		const first = await getFranceTravailAccessToken(ROME_METIERS_SCOPE, {
			fetchImpl: fetchImpl as unknown as typeof fetch,
			nowMs: t0,
		});
		expect(first).toBe("tok-1");
		expect(fetchImpl).toHaveBeenCalledOnce();

		const second = await getFranceTravailAccessToken(ROME_METIERS_SCOPE, {
			fetchImpl: fetchImpl as unknown as typeof fetch,
			nowMs: t0 + 60_000,
		});
		expect(second).toBe("tok-1");
		expect(fetchImpl).toHaveBeenCalledOnce();

		// Après expiry (1500s - 60s = 1440s)
		const third = await getFranceTravailAccessToken(ROME_METIERS_SCOPE, {
			fetchImpl: fetchImpl as unknown as typeof fetch,
			nowMs: t0 + 1_440_000 + 1,
		});
		expect(third).toBe("tok-1");
		expect(fetchImpl).toHaveBeenCalledTimes(2);
	});

	it("lève ValidationError si les credentials manquent", async () => {
		delete process.env.FRANCE_TRAVAIL_CLIENT_ID;
		delete process.env.FRANCE_TRAVAIL_CLIENT_SECRET;

		await expect(
			getFranceTravailAccessToken(ROME_METIERS_SCOPE, {
				fetchImpl: vi.fn() as unknown as typeof fetch,
			}),
		).rejects.toBeInstanceOf(ValidationError);
	});

	it("lève AuthenticationError si le token endpoint échoue", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
			json: async () => ({
				error: "invalid_client",
				error_description: "Client not authorized",
			}),
		});

		await expect(
			getFranceTravailAccessToken(ROME_METIERS_SCOPE, {
				fetchImpl: fetchImpl as unknown as typeof fetch,
			}),
		).rejects.toBeInstanceOf(AuthenticationError);
	});
});
