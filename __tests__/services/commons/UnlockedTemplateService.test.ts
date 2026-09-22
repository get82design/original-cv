import { describe, expect, it } from "vitest";
import { unlockedTemplateService } from "../../../src/services/commons/unlockedTemplateService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { ConflictError, NotFoundError, ValidationError } from "../../../src/services/errors";
import { prismaTest } from "../../../lib/prismaTest";

describe("UnlockedTemplateService.unlockTemplate", () => {
	it("unlocks a template for a user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(user.id);
		expect(unlockedTemplates.length).toBe(1);
		expect(unlockedTemplates[0]?.userId).toBe(user.id);
		expect(unlockedTemplates[0]?.templateId).toBe(template.id);
	});

	it("applies unlockGifts (free DL + credits) once", async () => {
		const user = await createTestUser();
		const before = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: {
				isPremium: true,
				unlockGifts: { downloadCredits: 3, freeDownloads: 2 },
			},
		});

		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});

		const after = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(after.downloadCredits).toBe(before.downloadCredits + 3);
		expect(after.freeDownloadsRemaining).toBe(before.freeDownloadsRemaining + 2);

		const grant = await prismaTest.downloadGrant.findUnique({
			where: {
				userId_reason: {
					userId: user.id,
					reason: `TEMPLATE_UNLOCK:${template.id}`,
				},
			},
		});
		expect(grant?.amount).toBe(2);
	});

	it("credits unlock consumes priceCredits and skips credit gifts", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 10, freeDownloadsRemaining: 1 },
		});
		const before = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: {
				isPremium: true,
				priceCredits: 4,
				unlockGifts: { downloadCredits: 3, freeDownloads: 2 },
			},
		});

		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "credits",
		});

		const after = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		// 10 - 4, pas de +3 cadeau crédits
		expect(after.downloadCredits).toBe(6);
		expect(after.freeDownloadsRemaining).toBe(before.freeDownloadsRemaining + 2);
		const row = await prismaTest.unlockedTemplate.findUniqueOrThrow({
			where: {
				userId_templateId: {
					userId: user.id,
					templateId: template.id,
				},
			},
		});
		expect(row.method).toBe("CREDITS");
	});

	it("credits unlock rejects insufficient credits", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 1 },
		});
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isPremium: true, priceCredits: 5 },
		});

		await expect(
			unlockedTemplateService.unlockTemplate(user.id, template.id, {
				method: "credits",
			}),
		).rejects.toThrow(ValidationError);
	});

	it("throws an error if the user is not found", async () => {
		await expect(
			unlockedTemplateService.unlockTemplate("123", "123", {
				method: "gift",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throw an error if template is not found", async () => {
		const user = await createTestUser();
		await expect(
			unlockedTemplateService.unlockTemplate(user.id, "123", {
				method: "gift",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws an error if the template is already unlocked", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});
		await expect(
			unlockedTemplateService.unlockTemplate(user.id, template.id, {
				method: "gift",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("UnlockedTemplateService.findAllByUser", () => {
	it("returns all unlocked templates for a user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(user.id);
		expect(unlockedTemplates.length).toBe(1);
		expect(unlockedTemplates[0]?.userId).toBe(user.id);
		expect(unlockedTemplates[0]?.templateId).toBe(template.id);
	});

	it("returns an empty array if the user has no unlocked templates", async () => {
		const user = await createTestUser();
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(user.id);
		expect(unlockedTemplates.length).toBe(0);
	});

	it("throws an error if the user is not found", async () => {
		await expect(unlockedTemplateService.findAllByUser("123")).rejects.toThrow(NotFoundError);
	});
});

describe("UnlockedTemplateService.hasUnlocked", () => {
	it("returns true if the template is unlocked for the user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});
		const hasUnlocked = await unlockedTemplateService.hasUnlocked(user.id, template.id);
		expect(hasUnlocked).toBe(true);
	});

	it("returns false if the template is not unlocked for the user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const hasUnlocked = await unlockedTemplateService.hasUnlocked(user.id, template.id);
		expect(hasUnlocked).toBe(false);
	});
});

describe("UnlockedTemplateService.delete", () => {
	it("deletes an unlocked template for a user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});
		await unlockedTemplateService.delete(user.id, template.id);
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(user.id);
		expect(unlockedTemplates.length).toBe(0);
	});

	it("throws an error if the user is not found", async () => {
		await expect(unlockedTemplateService.delete("123", "123")).rejects.toThrow(NotFoundError);
	});

	it("throws an error if the template is not found", async () => {
		const user = await createTestUser();
		await expect(unlockedTemplateService.delete(user.id, "123")).rejects.toThrow(NotFoundError);
	});
});

describe("UnlockedTemplateService.unlockManyTemplates", () => {
	it("unlocks many templates for a user", async () => {
		const user = await createTestUser();
		const template1 = await createTestTemplate();
		const template2 = await createTestTemplate();
		const result = await unlockedTemplateService.unlockManyTemplates(user.id, [
			template1.id,
			template2.id,
		]);
		expect(result.count).toBe(2);
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(user.id);
		expect(unlockedTemplates.length).toBe(2);
		const ids = unlockedTemplates.map((u) => u.templateId);
		expect(ids).toContain(template1.id);
		expect(ids).toContain(template2.id);
	});

	it("skips already unlocked without double gifts", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { unlockGifts: { downloadCredits: 1 } },
		});
		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});
		const mid = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		const result = await unlockedTemplateService.unlockManyTemplates(user.id, [template.id]);
		expect(result.count).toBe(0);
		const after = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(after.downloadCredits).toBe(mid.downloadCredits);
	});

	it("throws an error if the user is not found", async () => {
		await expect(
			unlockedTemplateService.unlockManyTemplates("123", ["123", "123"]),
		).rejects.toThrow(NotFoundError);
	});

	it("throws an error if the templates are not found", async () => {
		const user = await createTestUser();
		await expect(
			unlockedTemplateService.unlockManyTemplates(user.id, ["123", "123"]),
		).rejects.toThrow(NotFoundError);
	});
});
