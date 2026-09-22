import { describe, expect, it } from "vitest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";
import { prismaTest } from "../../lib/prismaTest";

describe("admin.unlockTemplateForUser", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.unlockTemplateForUser({
				userId: user.id,
				templateId: template.id,
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("gifts a premium template with unlockGifts", async () => {
		const target = await createTestUser();
		const before = await prismaTest.user.findUniqueOrThrow({
			where: { id: target.id },
		});
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: {
				isPremium: true,
				unlockGifts: { downloadCredits: 2, freeDownloads: 1 },
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

		const unlocked = await caller.admin.unlockTemplateForUser({
			userId: target.id,
			templateId: template.id,
		});

		expect(unlocked.userId).toBe(target.id);
		expect(unlocked.templateId).toBe(template.id);
		expect(unlocked.method).toBe("GIFT");

		const after = await prismaTest.user.findUniqueOrThrow({
			where: { id: target.id },
		});
		expect(after.downloadCredits).toBe(before.downloadCredits + 2);
		expect(after.freeDownloadsRemaining).toBe(before.freeDownloadsRemaining + 1);

		const detail = await caller.admin.getUser({ id: target.id });
		const hit = detail.purchaseHistory.find(
			(p) => p.kind === "TEMPLATE" && p.templateId === template.id,
		);
		expect(hit?.method).toBe("GIFT");
		expect(hit?.label).toBe(template.name);
		expect(hit?.amountLabel).toBe("1 free DL · 2 crédits");
	});

	it("returns CONFLICT when already unlocked", async () => {
		const target = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isPremium: true },
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		await caller.admin.unlockTemplateForUser({
			userId: target.id,
			templateId: template.id,
		});

		await expect(
			caller.admin.unlockTemplateForUser({
				userId: target.id,
				templateId: template.id,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});
});
