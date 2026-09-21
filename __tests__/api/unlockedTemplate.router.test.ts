import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { prismaTest } from "../../lib/prismaTest";

async function prepareCreditsUnlock(userId: string, templateId: string) {
	await prismaTest.user.update({
		where: { id: userId },
		data: { downloadCredits: 10 },
	});
	await prismaTest.cVTemplate.update({
		where: { id: templateId },
		data: { isPremium: true, priceCredits: 1 },
	});
}

describe("unlockedTemplateRouter", () => {
	it("unlock with method credits consumes priceCredits", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 8 },
		});
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: {
				isPremium: true,
				priceCredits: 3,
				unlockGifts: { downloadCredits: 5, freeDownloads: 1 },
			},
		});

		await caller.unlockedTemplate.unlock({
			templateId: template.id,
			method: "credits",
		});

		const after = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(after.downloadCredits).toBe(5);

		const row = await prismaTest.unlockedTemplate.findUniqueOrThrow({
			where: {
				userId_templateId: {
					userId: user.id,
					templateId: template.id,
				},
			},
		});
		expect(row.method).toBe("CREDITS");

		const list = await caller.unlockedTemplate.findAll();
		expect(list.some((u) => u.templateId === template.id)).toBe(true);
	});

	it("unlock returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const template = await createTestTemplate();

		await expect(
			caller.unlockedTemplate.unlock({
				templateId: template.id,
				method: "credits",
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("unlock unlocks a template for the current user", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		await prepareCreditsUnlock(user.id, template.id);

		const unlocked = await caller.unlockedTemplate.unlock({
			templateId: template.id,
			method: "credits",
		});

		expect(unlocked.userId).toBe(user.id);
		expect(unlocked.templateId).toBe(template.id);
		expect(unlocked.template.id).toBe(template.id);
		expect(unlocked.method).toBe("CREDITS");
	});

	it("unlock returns NOT_FOUND for unknown template", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.unlockedTemplate.unlock({
				templateId: "unknown-id",
				method: "credits",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("unlock returns CONFLICT when already unlocked", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		await prepareCreditsUnlock(user.id, template.id);

		await caller.unlockedTemplate.unlock({
			templateId: template.id,
			method: "credits",
		});

		await expect(
			caller.unlockedTemplate.unlock({
				templateId: template.id,
				method: "credits",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("unlockMany unlocks several templates", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const t1 = await createTestTemplate();
		const t2 = await createTestTemplate();

		const result = await caller.unlockedTemplate.unlockMany({
			templateIds: [t1.id, t2.id],
		});

		expect(result.count).toBe(2);

		const list = await caller.unlockedTemplate.findAll();
		expect(list).toHaveLength(2);
		expect(list.map((u) => u.templateId).sort()).toEqual(
			[t1.id, t2.id].sort(),
		);
	});

	it("unlockMany rejects invalid input (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.unlockedTemplate.unlockMany({ templateIds: [] }),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("unlockMany returns NOT_FOUND when a template is missing", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const t1 = await createTestTemplate();

		await expect(
			caller.unlockedTemplate.unlockMany({
				templateIds: [t1.id, "unknown-id"],
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("findAll returns unlocked templates for the current user", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		await prepareCreditsUnlock(user.id, template.id);

		await caller.unlockedTemplate.unlock({
			templateId: template.id,
			method: "credits",
		});

		const list = await caller.unlockedTemplate.findAll();

		expect(list).toHaveLength(1);
		expect(list[0]?.templateId).toBe(template.id);
		expect(list[0]?.userId).toBe(user.id);
	});

	it("findAll returns empty array when none unlocked", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const list = await caller.unlockedTemplate.findAll();

		expect(list).toEqual([]);
	});

	it("findAll returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.unlockedTemplate.findAll()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("hasUnlocked returns true/false", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		await prepareCreditsUnlock(user.id, template.id);

		expect(
			await caller.unlockedTemplate.hasUnlocked({
				templateId: template.id,
			}),
		).toBe(false);

		await caller.unlockedTemplate.unlock({
			templateId: template.id,
			method: "credits",
		});

		expect(
			await caller.unlockedTemplate.hasUnlocked({
				templateId: template.id,
			}),
		).toBe(true);
	});

	it("delete removes an unlocked template", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		await prepareCreditsUnlock(user.id, template.id);

		await caller.unlockedTemplate.unlock({
			templateId: template.id,
			method: "credits",
		});
		await caller.unlockedTemplate.delete({ templateId: template.id });

		const list = await caller.unlockedTemplate.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND when not unlocked", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();

		await expect(
			caller.unlockedTemplate.delete({ templateId: template.id }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
