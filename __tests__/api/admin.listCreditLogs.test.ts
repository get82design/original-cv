import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("admin.listCreditLogs", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.listCreditLogs({ period: "7d" }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("lists credit movements for ADMIN", async () => {
		const target = await createTestUser();
		const admin = await createTestUser();
		await prismaTest.adminCreditLog.create({
			data: {
				kind: "DOWNLOAD_CREDITS",
				reason: "ADMIN_SET",
				before: 0,
				after: 5,
				delta: 5,
				targetUserId: target.id,
				actorUserId: admin.id,
			},
		});

		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const result = await caller.admin.listCreditLogs({
			period: "all",
			page: 1,
			pageSize: 20,
		});

		expect(result.total).toBeGreaterThanOrEqual(1);
		const hit = result.items.find((i) => i.targetUserId === target.id);
		expect(hit).toBeTruthy();
		expect(hit?.delta).toBe(5);
		expect(hit?.actorUserEmail).toBe(admin.email);
		expect(hit?.targetUserEmail).toBe(target.email);
	});

	it("filters by kind and search", async () => {
		const target = await createTestUser();
		const unique = `credit-search-${Date.now()}`;
		await prismaTest.user.update({
			where: { id: target.id },
			data: { email: `${unique}@test.com` },
		});
		const admin = await createTestUser();
		await prismaTest.adminCreditLog.create({
			data: {
				kind: "FREE_DOWNLOADS",
				reason: "ADMIN_SET",
				before: 0,
				after: 2,
				delta: 2,
				targetUserId: target.id,
				actorUserId: admin.id,
			},
		});

		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const byKind = await caller.admin.listCreditLogs({
			period: "all",
			kind: "FREE_DOWNLOADS",
		});
		expect(byKind.items.every((i) => i.kind === "FREE_DOWNLOADS")).toBe(
			true,
		);

		const bySearch = await caller.admin.listCreditLogs({
			period: "all",
			search: unique,
		});
		expect(bySearch.items.some((i) => i.targetUserId === target.id)).toBe(
			true,
		);
	});
});
