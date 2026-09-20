import { describe, expect, it } from "vitest";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { prismaTest } from "../../lib/prismaTest";

describe("admin.listUsers", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(caller.admin.listUsers({})).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("lists users for ADMIN with search", async () => {
		const unique = `admin-list-${Date.now()}`;
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { email: `${unique}@test.com`, name: unique },
		});

		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		const result = await caller.admin.listUsers({
			search: unique,
			page: 1,
			pageSize: 20,
		});

		expect(result.total).toBeGreaterThanOrEqual(1);
		expect(result.items.some((u) => u.id === user.id)).toBe(true);
		expect(result.items[0]).toMatchObject({
			email: expect.any(String),
			plan: expect.any(String),
			cvCount: expect.any(Number),
		});
	});
});
