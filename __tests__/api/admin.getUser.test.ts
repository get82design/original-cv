import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("admin.getUser", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.getUser({ id: user.id }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("returns detail for ADMIN", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		const detail = await caller.admin.getUser({ id: user.id });
		expect(detail.id).toBe(user.id);
		expect(detail.email).toBe(user.email);
		expect(detail.cvs).toEqual([]);
		expect(detail.recentDownloads).toEqual([]);
		expect(detail.recentAiEvents).toEqual([]);
		expect(detail.purchaseHistory).toEqual([]);
		expect(detail.downloadCount).toBe(0);
	});

	it("returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		await expect(
			caller.admin.getUser({ id: "unknown-user-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("includes unlocked templates and download grants in purchaseHistory", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.unlockedTemplate.create({
			data: { userId: user.id, templateId: template.id },
		});
		await prismaTest.downloadGrant.create({
			data: {
				userId: user.id,
				reason: "PROFILE_CREATED",
				amount: 1,
			},
		});

		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		const detail = await caller.admin.getUser({ id: user.id });
		expect(detail.purchaseHistory).toHaveLength(2);
		expect(
			detail.purchaseHistory.some(
				(p) => p.kind === "TEMPLATE" && p.label === template.name,
			),
		).toBe(true);
		expect(
			detail.purchaseHistory.some(
				(p) =>
					p.kind === "FREE_GRANT" &&
					p.label.includes("profil") &&
					p.amount === 1,
			),
		).toBe(true);
	});
});
