import { describe, expect, it } from "vitest";
import { TRPCClientError } from "@trpc/client";
import { getClientErrorMessage, isTooManyRequestsError } from "../../src/utils/clientError";

describe("getClientErrorMessage", () => {
	it("lit le message d’un TRPCClientError", () => {
		const err = TRPCClientError.from(new Error("L’assistant est temporairement saturé."));
		Object.assign(err, {
			data: { code: "TOO_MANY_REQUESTS" },
		});
		expect(getClientErrorMessage(err)).toMatch(/saturé/i);
	});

	it("lit un Error classique", () => {
		expect(getClientErrorMessage(new Error("boom"))).toBe("boom");
	});

	it("fallback si inconnu", () => {
		expect(getClientErrorMessage(null, "fallback")).toBe("fallback");
	});
});

describe("isTooManyRequestsError", () => {
	it("détecte le code TOO_MANY_REQUESTS", () => {
		const err = TRPCClientError.from(new Error("saturé"));
		Object.assign(err, { data: { code: "TOO_MANY_REQUESTS" } });
		expect(isTooManyRequestsError(err)).toBe(true);
	});

	it("ignore les autres codes", () => {
		const err = TRPCClientError.from(new Error("bad"));
		Object.assign(err, { data: { code: "BAD_REQUEST" } });
		expect(isTooManyRequestsError(err)).toBe(false);
	});
});
