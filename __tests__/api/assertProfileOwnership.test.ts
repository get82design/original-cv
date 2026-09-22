import { describe, expect, it } from "vitest";
import { assertProfileOwnership } from "../../server/api/helpers/assertProfileOwnership";
import { ForbiddenError } from "../../src/services/errors";

describe("assertProfileOwnership", () => {
	it("allows when target user matches session user", () => {
		expect(() =>
			assertProfileOwnership("user-1", "user-1"),
		).not.toThrow();
	});

	it("rejects when target user differs from session user", () => {
		expect(() => assertProfileOwnership("user-1", "user-2")).toThrow(
			ForbiddenError,
		);
		expect(() => assertProfileOwnership("user-1", "user-2")).toThrow(
			/You cannot access this Profile/,
		);
	});
});
