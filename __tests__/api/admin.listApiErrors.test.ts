import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("admin.listApiErrors", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.listApiErrors({ period: "7d" }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("returns API error events for ADMIN", async () => {
		const user = await createTestUser();
		await prismaTest.apiErrorEvent.create({
			data: {
				path: "cv.save",
				code: "INTERNAL_SERVER_ERROR",
				message: "boom test",
				userId: user.id,
			},
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const result = await caller.admin.listApiErrors({
			period: "all",
			page: 1,
			pageSize: 20,
		});

		expect(result.total).toBeGreaterThanOrEqual(1);
		const hit = result.items.find((i) => i.message === "boom test");
		expect(hit).toBeTruthy();
		expect(hit?.path).toBe("cv.save");
		expect(hit?.code).toBe("INTERNAL_SERVER_ERROR");
		expect(hit?.userEmail).toBe(user.email);
	});

	it("filters by code", async () => {
		const user = await createTestUser();
		await prismaTest.apiErrorEvent.create({
			data: {
				path: "ai.reviewCv",
				code: "TOO_MANY_REQUESTS",
				message: "429 gemini",
				userId: user.id,
			},
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const filtered = await caller.admin.listApiErrors({
			period: "all",
			code: "TOO_MANY_REQUESTS",
		});
		expect(filtered.items.every((i) => i.code === "TOO_MANY_REQUESTS")).toBe(
			true,
		);
		expect(
			filtered.items.some((i) => i.message === "429 gemini"),
		).toBe(true);
	});

	it("filters by path contains", async () => {
		const user = await createTestUser();
		await prismaTest.apiErrorEvent.create({
			data: {
				path: "unlockedTemplate.unlock",
				code: "BAD_REQUEST",
				message: "invalid unlock",
				userId: user.id,
			},
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const filtered = await caller.admin.listApiErrors({
			period: "all",
			path: "unlockedTemplate",
		});
		expect(
			filtered.items.every((i) =>
				i.path.toLowerCase().includes("unlockedtemplate"),
			),
		).toBe(true);
	});
});
