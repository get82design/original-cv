import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { toTrpcError } from "../../server/api/trpc";
import {
	AppError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	TooManyRequestsError,
	ValidationError,
} from "../../src/services/errors";

describe("toTrpcError", () => {
	it("maps CV_ALREADY_EXISTS to CONFLICT (L17)", () => {
		const err = new AppError("CV_ALREADY_EXISTS", "Le CV existe déjà");
		const trpcErr = toTrpcError(err);

		expect(trpcErr).toBeInstanceOf(TRPCError);
		expect(trpcErr.code).toBe("CONFLICT");
		expect(trpcErr.message).toBe("Le CV existe déjà");
		expect(trpcErr.cause).toBe(err);
	});

	it("maps unknown AppError code to INTERNAL_SERVER_ERROR (L18)", () => {
		const err = new AppError("SOMETHING_WEIRD", "unexpected");
		const trpcErr = toTrpcError(err);

		expect(trpcErr.code).toBe("INTERNAL_SERVER_ERROR");
		expect(trpcErr.message).toBe("unexpected");
	});

	it("maps plain Error to INTERNAL_SERVER_ERROR (L45)", () => {
		const err = new Error("boom");
		const trpcErr = toTrpcError(err);

		expect(trpcErr.code).toBe("INTERNAL_SERVER_ERROR");
		expect(trpcErr.message).toBe("boom");
		expect(trpcErr.cause).toBe(err);
	});

	it("maps non-Error unknown to INTERNAL_SERVER_ERROR with Unknown error (L45)", () => {
		const trpcErr = toTrpcError("not-an-error");

		expect(trpcErr.code).toBe("INTERNAL_SERVER_ERROR");
		expect(trpcErr.message).toBe("Unknown error");
	});

	// Bonus
	it("maps ConflictError by name to CONFLICT (L15)", () => {
		const err = new ConflictError("CV_LANGUAGE_ALREADY_EXISTS", "dup");
		expect(toTrpcError(err).code).toBe("CONFLICT");
	});

	it("maps ForbiddenError by name to FORBIDDEN (L16)", () => {
		const err = new ForbiddenError("FORBIDDEN", "nope");
		expect(toTrpcError(err).code).toBe("FORBIDDEN");
	});

	it("maps *_NOT_FOUND to NOT_FOUND", () => {
		const err = new NotFoundError("CV", "abc");
		expect(toTrpcError(err).code).toBe("NOT_FOUND");
	});

	it("maps ValidationError to BAD_REQUEST", () => {
		const err = new ValidationError("invalid");
		expect(toTrpcError(err).code).toBe("BAD_REQUEST");
	});

	it("maps TooManyRequestsError to TOO_MANY_REQUESTS", () => {
		const err = new TooManyRequestsError();
		const trpcErr = toTrpcError(err);
		expect(trpcErr.code).toBe("TOO_MANY_REQUESTS");
		expect(trpcErr.message).toMatch(/saturé/i);
	});

	it("unwraps TRPCError.cause when it is an AppError", () => {
		const cause = new AppError("CV_ALREADY_EXISTS", "exists");
		const wrapped = new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "wrapped",
			cause,
		});

		const trpcErr = toTrpcError(wrapped);
		expect(trpcErr.code).toBe("CONFLICT");
		expect(trpcErr.message).toBe("exists");
	});

	it("returns TRPCError as-is when it has no AppError cause (L43)", () => {
		const err = new TRPCError({ code: "BAD_REQUEST", message: "direct" });
		expect(toTrpcError(err)).toBe(err);
	});
});
