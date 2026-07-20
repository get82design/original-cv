import { describe, expect, it } from "vitest";
import { unlockedTemplateService } from "../../../src/services/commons/unlockedTemplateService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { ConflictError, NotFoundError } from "../../../src/services/errors";

describe("UnlockedTemplateService.unlockTemplate", () => {
	it("unlocks a template for a user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id);
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(
			user.id,
		);
		expect(unlockedTemplates.length).toBe(1);
		expect(unlockedTemplates[0]?.userId).toBe(user.id);
		expect(unlockedTemplates[0]?.templateId).toBe(template.id);
	});

	it("throws an error if the user is not found", async () => {
		await expect(
			unlockedTemplateService.unlockTemplate("123", "123"),
		).rejects.toThrow(NotFoundError);
	});

	it("throw an error if template is not found", async () => {
		const user = await createTestUser();
		await expect(
			unlockedTemplateService.unlockTemplate(user.id, "123"),
		).rejects.toThrow(NotFoundError);
	});

	it("throws an error if the template is already unlocked", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id);
		await expect(
			unlockedTemplateService.unlockTemplate(user.id, template.id),
		).rejects.toThrow(ConflictError);
	});
});

describe("UnlockedTemplateService.findAllByUser", () => {
	it("returns all unlocked templates for a user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id);
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(
			user.id,
		);
		expect(unlockedTemplates.length).toBe(1);
		expect(unlockedTemplates[0]?.userId).toBe(user.id);
		expect(unlockedTemplates[0]?.templateId).toBe(template.id);
	});

	it("returns an empty array if the user has no unlocked templates", async () => {
		const user = await createTestUser();
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(
			user.id,
		);
		expect(unlockedTemplates.length).toBe(0);
	});

	it("throws an error if the user is not found", async () => {
		await expect(unlockedTemplateService.findAllByUser("123")).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("UnlockedTemplateService.hasUnlocked", () => {
	it("returns true if the template is unlocked for the user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id);
		const hasUnlocked = await unlockedTemplateService.hasUnlocked(
			user.id,
			template.id,
		);
		expect(hasUnlocked).toBe(true);
	});

	it("returns false if the template is not unlocked for the user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const hasUnlocked = await unlockedTemplateService.hasUnlocked(
			user.id,
			template.id,
		);
		expect(hasUnlocked).toBe(false);
	});
});

describe("UnlockedTemplateService.delete", () => {
	it("deletes an unlocked template for a user", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await unlockedTemplateService.unlockTemplate(user.id, template.id);
		await unlockedTemplateService.delete(user.id, template.id);
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(
			user.id,
		);
		expect(unlockedTemplates.length).toBe(0);
	});

	it("throws an error if the user is not found", async () => {
		await expect(unlockedTemplateService.delete("123", "123")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("throws an error if the template is not found", async () => {
		const user = await createTestUser();
		await expect(
			unlockedTemplateService.delete(user.id, "123"),
		).rejects.toThrow(NotFoundError);
	});
});

describe("UnlockedTemplateService.unlockManyTemplates", () => {
	it("unlocks many templates for a user", async () => {
		const user = await createTestUser();
		const template1 = await createTestTemplate();
		const template2 = await createTestTemplate();
		const templates = [template1.id, template2.id];
		await unlockedTemplateService.unlockManyTemplates(user.id, templates);
		const unlockedTemplates = await unlockedTemplateService.findAllByUser(
			user.id,
		);
		expect(unlockedTemplates.length).toBe(2);
		expect(unlockedTemplates[0]?.userId).toBe(user.id);
		expect(unlockedTemplates[0]?.templateId).toBe(template1.id);
		expect(unlockedTemplates[1]?.userId).toBe(user.id);
		expect(unlockedTemplates[1]?.templateId).toBe(template2.id);
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
