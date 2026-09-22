import { describe, expect, it } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import { adminUserService } from "../../../src/services/admin/adminUserService";
import { NotFoundError, ValidationError } from "../../../src/services/errors";
import { createTestTemplate } from "../../utils/create-test-template";
import { createTestUser } from "../../utils/create-test-user";

describe("adminUserService", () => {
	it("listUsers filters by isActive and plan", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { isActive: false, plan: "FREE" },
		});

		const inactive = await adminUserService.listUsers({
			isActive: false,
			plan: "FREE",
			search: user.email,
			page: 1,
			pageSize: 10,
		});
		expect(inactive.items.some((u) => u.id === user.id)).toBe(true);

		const activeOnly = await adminUserService.listUsers({
			isActive: true,
			search: user.email,
		});
		expect(activeOnly.items.some((u) => u.id === user.id)).toBe(false);
	});

	it("updateUser rejects empty patch", async () => {
		const user = await createTestUser();
		await expect(adminUserService.updateUser(user.id, {})).rejects.toThrow(
			ValidationError,
		);
	});

	it("updateUser clears subscriptionEnd when downgrading to FREE", async () => {
		const user = await createTestUser();
		const end = new Date("2027-06-01T00:00:00.000Z");
		await prismaTest.user.update({
			where: { id: user.id },
			data: { plan: "PREMIUM", subscriptionEnd: end },
		});

		const updated = await adminUserService.updateUser(user.id, {
			plan: "FREE",
		});
		expect(updated.plan).toBe("FREE");
		expect(updated.subscriptionEnd).toBeNull();
	});

	it("softResetUser returns NOT_FOUND for unknown id", async () => {
		await expect(
			adminUserService.softResetUser("missing-user-id"),
		).rejects.toThrow(NotFoundError);
	});

	it("softResetUser skips credit logs when already zero", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: {
				downloadCredits: 0,
				freeDownloadsRemaining: 0,
				iaRequestsUsed: 3,
			},
		});

		const reset = await adminUserService.softResetUser(user.id);
		expect(reset.iaRequestsUsed).toBe(0);

		const logs = await prismaTest.adminCreditLog.findMany({
			where: { targetUserId: user.id, reason: "ADMIN_SOFT_RESET" },
		});
		expect(logs).toHaveLength(0);
	});

	it("getUserDetail builds amountLabel from unlock gifts", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: {
				unlockGifts: { downloadCredits: 2, freeDownloads: 1 },
			},
		});
		await prismaTest.unlockedTemplate.create({
			data: {
				userId: user.id,
				templateId: template.id,
				method: "GIFT",
			},
		});

		const detail = await adminUserService.getUserDetail(user.id);
		const row = detail.purchaseHistory.find(
			(p) => p.kind === "TEMPLATE" && p.templateId === template.id,
		);
		expect(row?.amountLabel).toBe("1 free DL · 2 crédits");
	});

	it("getUserDetail omits credit gifts when unlock method is CREDITS", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: {
				unlockGifts: { downloadCredits: 3, freeDownloads: 2 },
			},
		});
		await prismaTest.unlockedTemplate.create({
			data: {
				userId: user.id,
				templateId: template.id,
				method: "CREDITS",
			},
		});

		const detail = await adminUserService.getUserDetail(user.id);
		const row = detail.purchaseHistory.find(
			(p) => p.kind === "TEMPLATE" && p.templateId === template.id,
		);
		expect(row?.amountLabel).toBe("2 free DL");
	});

	it("getUserDetail labels known and custom free grants", async () => {
		const user = await createTestUser();
		await prismaTest.downloadGrant.createMany({
			data: [
				{
					userId: user.id,
					reason: "FIRST_CV_SAVED",
					amount: 1,
				},
				{
					userId: user.id,
					reason: "TEMPLATE_PURCHASED",
					amount: 2,
				},
				{
					userId: user.id,
					reason: "CUSTOM_PROMO",
					amount: 0,
				},
			],
		});

		const detail = await adminUserService.getUserDetail(user.id);
		const labels = detail.purchaseHistory
			.filter((p) => p.kind === "FREE_GRANT")
			.map((p) => p.label);

		expect(labels).toEqual(
			expect.arrayContaining([
				"Cadeau · 1er CV sauvé",
				"Cadeau · achat template",
				"CUSTOM_PROMO",
			]),
		);
		expect(
			detail.purchaseHistory.find((p) => p.label === "CUSTOM_PROMO")
				?.amountLabel,
		).toBeNull();
	});

	it("getUserDetail resolves template names from unlock grants without unlock row", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.downloadGrant.create({
			data: {
				userId: user.id,
				reason: `TEMPLATE_UNLOCK:${template.id}`,
				amount: 1,
			},
		});

		const detail = await adminUserService.getUserDetail(user.id);
		// TEMPLATE_UNLOCK grants are filtered out of purchaseHistory
		expect(
			detail.purchaseHistory.some((p) =>
				p.label.includes(template.name),
			),
		).toBe(false);
		expect(detail.id).toBe(user.id);
	});
});
