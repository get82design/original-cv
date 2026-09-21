import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("admin.updateUser", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.updateUser({ id: user.id, isActive: false }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("updates isActive, credits and free downloads", async () => {
		const target = await createTestUser();
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const updated = await caller.admin.updateUser({
			id: target.id,
			isActive: false,
			downloadCredits: 7,
			freeDownloadsRemaining: 2,
		});

		expect(updated.isActive).toBe(false);
		expect(updated.downloadCredits).toBe(7);
		expect(updated.freeDownloadsRemaining).toBe(2);

		const row = await prismaTest.user.findUniqueOrThrow({
			where: { id: target.id },
		});
		expect(row.isActive).toBe(false);
		expect(row.downloadCredits).toBe(7);
		expect(row.freeDownloadsRemaining).toBe(2);

		const logs = await prismaTest.adminCreditLog.findMany({
			where: { targetUserId: target.id },
			orderBy: { kind: "asc" },
		});
		expect(logs).toHaveLength(2);
		expect(logs.map((l) => l.kind).sort()).toEqual([
			"DOWNLOAD_CREDITS",
			"FREE_DOWNLOADS",
		]);
		expect(logs.every((l) => l.actorUserId === admin.id)).toBe(true);
		expect(logs.every((l) => l.reason === "ADMIN_SET")).toBe(true);
	});

	it("blocks self-deactivation", async () => {
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		await expect(
			caller.admin.updateUser({ id: admin.id, isActive: false }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("returns NOT_FOUND for unknown id", async () => {
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		await expect(
			caller.admin.updateUser({
				id: "unknown-user-id",
				downloadCredits: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("updates plan and subscriptionEnd", async () => {
		const target = await createTestUser();
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const end = new Date("2027-01-15T00:00:00.000Z");
		const updated = await caller.admin.updateUser({
			id: target.id,
			plan: "PREMIUM",
			subscriptionEnd: end,
		});

		expect(updated.plan).toBe("PREMIUM");
		expect(updated.subscriptionEnd?.toISOString()).toBe(end.toISOString());
	});

	it("requires subscriptionEnd for premium plans", async () => {
		const target = await createTestUser();
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		await expect(
			caller.admin.updateUser({ id: target.id, plan: "PREMIUM" }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});
});

describe("admin.softResetUser", () => {
	it("zeros credits, free DL and IA counter", async () => {
		const target = await createTestUser();
		await prismaTest.user.update({
			where: { id: target.id },
			data: {
				downloadCredits: 4,
				freeDownloadsRemaining: 2,
				iaRequestsUsed: 9,
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

		const reset = await caller.admin.softResetUser({ id: target.id });
		expect(reset.downloadCredits).toBe(0);
		expect(reset.freeDownloadsRemaining).toBe(0);
		expect(reset.iaRequestsUsed).toBe(0);

		const row = await prismaTest.user.findUniqueOrThrow({
			where: { id: target.id },
		});
		expect(row.downloadCredits).toBe(0);
		expect(row.freeDownloadsRemaining).toBe(0);
		expect(row.iaRequestsUsed).toBe(0);

		const logs = await prismaTest.adminCreditLog.findMany({
			where: { targetUserId: target.id, reason: "ADMIN_SOFT_RESET" },
		});
		expect(logs.length).toBeGreaterThanOrEqual(2);
		expect(logs.every((l) => l.actorUserId === admin.id)).toBe(true);
		expect(logs.every((l) => l.after === 0)).toBe(true);
	});
});
