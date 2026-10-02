import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { franceTravailGetJson } from "../../../src/services/france-travail/franceTravailClient";
import * as auth from "../../../src/services/france-travail/franceTravailAuth";
import {
	AuthenticationError,
	TooManyRequestsError,
	ValidationError,
} from "../../../src/services/errors";

describe("franceTravailClient", () => {
	beforeEach(() => {
		vi.spyOn(auth, "getFranceTravailAccessToken").mockResolvedValue("tok");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("retourne le JSON sur 200", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			headers: { get: () => null },
			json: async () => ({ code: "M1805" }),
		});

		const data = await franceTravailGetJson<{ code: string }>({
			path: "/rome-metiers/v1/metiers/metier/M1805",
			fetchImpl: fetchImpl as unknown as typeof fetch,
		});

		expect(data.code).toBe("M1805");
		expect(fetchImpl).toHaveBeenCalledOnce();
		const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
		expect(url).toContain("/rome-metiers/v1/metiers/metier/M1805");
		expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
	});

	it("mappe 429 vers TooManyRequestsError", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: false,
			status: 429,
			headers: { get: (h: string) => (h === "Retry-After" ? "1" : null) },
			json: async () => ({}),
		});

		await expect(
			franceTravailGetJson({
				path: "/rome-metiers/v1/metiers/metier/M1805",
				fetchImpl: fetchImpl as unknown as typeof fetch,
			}),
		).rejects.toBeInstanceOf(TooManyRequestsError);
	});

	it("mappe 403 vers AuthenticationError", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: false,
			status: 403,
			headers: { get: () => null },
			json: async () => ({ message: "Invalid scope" }),
		});

		await expect(
			franceTravailGetJson({
				path: "/rome-fiches-metiers/v1/fiches-rome/fiche-metier/M1805",
				scopeKind: "fiches",
				fetchImpl: fetchImpl as unknown as typeof fetch,
			}),
		).rejects.toBeInstanceOf(AuthenticationError);
	});

	it("mappe 404 vers ValidationError", async () => {
		const fetchImpl = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			headers: { get: () => null },
			json: async () => ({}),
		});

		await expect(
			franceTravailGetJson({
				path: "/rome-metiers/v1/metiers/metier/Z9999",
				fetchImpl: fetchImpl as unknown as typeof fetch,
			}),
		).rejects.toBeInstanceOf(ValidationError);
	});
});
