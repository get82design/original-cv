import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { adminCreditPackService } from "../../src/services/admin/adminCreditPackService";
import { aiBillingService } from "../../src/services/ai/aiBillingService";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("admin billing (packs + AI prices)", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.admin.listCreditPacks()).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
		await expect(caller.admin.listAiFeaturePrices()).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("lists and upserts AI prices for ADMIN", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		await aiBillingService.upsertPrice({
			feature: "REVIEW_CV",
			costFree: null,
			costPaid: 2,
		});

		const prices = await caller.admin.listAiFeaturePrices();
		expect(prices.some((p) => p.feature === "REVIEW_CV")).toBe(true);

		const updated = await caller.admin.upsertAiFeaturePrice({
			feature: "REVIEW_CV",
			costFree: 1,
			costPaid: 3,
		});
		expect(updated.costFree).toBe(1);
		expect(updated.costPaid).toBe(3);
	});

	it("CRUD credit packs for ADMIN", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		const created = await caller.admin.createCreditPack({
			name: "Test pack",
			priceCents: 499,
			downloadCredits: 3,
			freeDownloads: 1,
			sortOrder: 1,
			isActive: true,
		});
		expect(created.name).toBe("Test pack");

		const listed = await caller.admin.listCreditPacks();
		expect(listed.some((p) => p.id === created.id)).toBe(true);

		const updated = await caller.admin.updateCreditPack({
			id: created.id,
			name: "Test pack v2",
			downloadCredits: 5,
		});
		expect(updated.name).toBe("Test pack v2");
		expect(updated.downloadCredits).toBe(5);

		await caller.admin.deleteCreditPack({ id: created.id });
		const after = await adminCreditPackService.listPacks();
		expect(after.some((p) => p.id === created.id)).toBe(false);

		await prismaTest.creditPack.deleteMany({
			where: { name: { startsWith: "Test pack" } },
		});
	});

	it("rejects createCreditPack with empty name via Zod", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		await expect(
			caller.admin.createCreditPack({
				name: "   ",
				priceCents: 100,
				downloadCredits: 1,
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("rejects deleteCreditPack for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		await expect(
			caller.admin.deleteCreditPack({ id: "missing-pack-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("rejects updateCreditPack for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: user.id,
				email: user.email,
				role: "ADMIN",
			}),
		);

		await expect(
			caller.admin.updateCreditPack({
				id: "missing-pack-id",
				name: "Nope",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
