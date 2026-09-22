import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("admin.listAiEvents", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(caller.admin.listAiEvents({ period: "7d" })).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("returns AI events for ADMIN", async () => {
		const user = await createTestUser();
		await prismaTest.aiEvent.create({
			data: {
				feature: "REWRITE_SECTION",
				detail: "Profil",
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

		const result = await caller.admin.listAiEvents({
			period: "all",
			page: 1,
			pageSize: 20,
		});

		expect(result.total).toBeGreaterThanOrEqual(1);
		const hit = result.items.find((i) => i.detail === "Profil");
		expect(hit).toBeTruthy();
		expect(hit?.feature).toBe("REWRITE_SECTION");
		expect(hit?.userEmail).toBe(user.email);
	});

	it("filters by feature", async () => {
		const user = await createTestUser();
		await prismaTest.aiEvent.create({
			data: { feature: "IMPORT_CV", userId: user.id },
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const imports = await caller.admin.listAiEvents({
			period: "all",
			feature: "IMPORT_CV",
		});
		expect(imports.items.every((i) => i.feature === "IMPORT_CV")).toBe(true);
	});

	it("filters by email search", async () => {
		const user = await createTestUser();
		const unique = `ai-search-${Date.now()}`;
		await prismaTest.user.update({
			where: { id: user.id },
			data: { email: `${unique}@test.com` },
		});
		await prismaTest.aiEvent.create({
			data: { feature: "REVIEW_CV", userId: user.id },
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const result = await caller.admin.listAiEvents({
			period: "all",
			search: unique,
		});
		expect(result.items.some((i) => i.userId === user.id)).toBe(true);
	});
});
