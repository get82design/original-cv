import { describe, expect, it, vi } from "vitest";
import { isTransientGeminiError, withTransientRetry } from "../../../src/services/ai/geminiService";
import { TooManyRequestsError } from "../../../src/services/errors";

describe("isTransientGeminiError", () => {
	it("détecte status 503 / 429", () => {
		expect(isTransientGeminiError({ status: 503, message: "x" })).toBe(true);
		expect(isTransientGeminiError({ status: 429, message: "x" })).toBe(true);
	});

	it("détecte message overloaded / unavailable", () => {
		expect(
			isTransientGeminiError({
				message: "The model is overloaded. Please try again later.",
			}),
		).toBe(true);
		expect(isTransientGeminiError({ message: "503 Service Unavailable" })).toBe(true);
	});

	it("ignore les erreurs métier / auth", () => {
		expect(isTransientGeminiError({ status: 401, message: "nope" })).toBe(false);
		expect(isTransientGeminiError(new Error("Invalid JSON"))).toBe(false);
		expect(isTransientGeminiError(null)).toBe(false);
	});
});

describe("withTransientRetry", () => {
	it("réussit après un 429 puis OK", async () => {
		const fn = vi
			.fn()
			.mockRejectedValueOnce({ status: 429, message: "rate limit" })
			.mockResolvedValueOnce("ok");

		await expect(withTransientRetry(fn)).resolves.toBe("ok");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("après épuisement des retries 429 → TooManyRequestsError", async () => {
		const fn = vi.fn().mockRejectedValue({ status: 429, message: "rate limit" });

		await expect(withTransientRetry(fn)).rejects.toBeInstanceOf(TooManyRequestsError);
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("ne wrappe pas une erreur métier", async () => {
		const err = new Error("Invalid JSON");
		const fn = vi.fn().mockRejectedValue(err);

		await expect(withTransientRetry(fn)).rejects.toBe(err);
		expect(fn).toHaveBeenCalledTimes(1);
	});
});
