import { describe, expect, it } from "vitest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { prismaTest } from "../../lib/prismaTest";
import { unlockedTemplateService } from "../../src/services/commons/unlockedTemplateService";

describe("admin.listUnlocks", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(caller.admin.listUnlocks({})).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("lists unlocks with method for ADMIN", async () => {
		const buyer = await createTestUser();
		await prismaTest.user.update({
			where: { id: buyer.id },
			data: { downloadCredits: 10 },
		});
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isPremium: true, priceCredits: 2 },
		});

		await unlockedTemplateService.unlockTemplate(buyer.id, template.id, {
			method: "credits",
		});

		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const result = await caller.admin.listUnlocks({
			period: "all",
			page: 1,
			pageSize: 50,
		});
		const hit = result.items.find(
			(i) =>
				i.userId === buyer.id && i.templateId === template.id,
		);
		expect(hit).toBeTruthy();
		expect(hit?.method).toBe("CREDITS");
		expect(hit?.templateName).toBe(template.name);
		expect(hit?.userEmail).toBe(buyer.email);
	});
});
