import { describe, expect, it } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import { adminApiErrorService } from "../../../src/services/admin/adminApiErrorService";
import { createTestUser } from "../../utils/create-test-user";

describe("AdminApiErrorService", () => {
	it("create persists a truncated message and optional user", async () => {
		const user = await createTestUser();
		const longMessage = "x".repeat(3_000);

		const created = await adminApiErrorService.create({
			path: "cv.save",
			code: "INTERNAL_SERVER_ERROR",
			message: longMessage,
			userId: user.id,
		});

		const row = await prismaTest.apiErrorEvent.findUniqueOrThrow({
			where: { id: created.id },
		});

		expect(row.path).toBe("cv.save");
		expect(row.code).toBe("INTERNAL_SERVER_ERROR");
		expect(row.message).toHaveLength(2_000);
		expect(row.userId).toBe(user.id);
	});

	it("create allows anonymous errors", async () => {
		const created = await adminApiErrorService.create({
			path: "user.register",
			code: "BAD_REQUEST",
			message: "email taken",
		});

		const row = await prismaTest.apiErrorEvent.findUniqueOrThrow({
			where: { id: created.id },
		});

		expect(row.userId).toBeNull();
		expect(row.message).toBe("email taken");
	});

	it("listApiErrors filters by search email", async () => {
		const user = await createTestUser();
		await adminApiErrorService.create({
			path: "cv.save",
			code: "INTERNAL_SERVER_ERROR",
			message: "search-me-error",
			userId: user.id,
		});

		const result = await adminApiErrorService.listApiErrors({
			period: "all",
			search: user.email.slice(0, 8),
		});

		expect(result.items.some((i) => i.message === "search-me-error")).toBe(true);
		expect(
			result.items
				.filter((i) => i.message === "search-me-error")
				.every((i) => i.userEmail === user.email),
		).toBe(true);
	});
});
