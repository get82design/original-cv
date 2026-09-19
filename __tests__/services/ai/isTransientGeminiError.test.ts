import { describe, expect, it } from "vitest";
import { isTransientGeminiError } from "../../../src/services/ai/geminiService";

describe("isTransientGeminiError", () => {
	it("détecte status 503 / 429", () => {
		expect(isTransientGeminiError({ status: 503, message: "x" })).toBe(
			true,
		);
		expect(isTransientGeminiError({ status: 429, message: "x" })).toBe(
			true,
		);
	});

	it("détecte message overloaded / unavailable", () => {
		expect(
			isTransientGeminiError({
				message: "The model is overloaded. Please try again later.",
			}),
		).toBe(true);
		expect(
			isTransientGeminiError({ message: "503 Service Unavailable" }),
		).toBe(true);
	});

	it("ignore les erreurs métier / auth", () => {
		expect(isTransientGeminiError({ status: 401, message: "nope" })).toBe(
			false,
		);
		expect(isTransientGeminiError(new Error("Invalid JSON"))).toBe(false);
		expect(isTransientGeminiError(null)).toBe(false);
	});
});
