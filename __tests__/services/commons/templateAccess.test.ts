import { describe, expect, it } from "vitest";
import {
	canUnlockTemplate,
	canUseTemplate,
	canDownloadTemplate,
	isListedInCatalog,
	parseUnlockGifts,
	reasonCannotUseTemplate,
	reasonCannotDownloadTemplate,
} from "../../../src/services/commons/templateAccess";
import { templateAccessService } from "../../../src/services/commons/templateAccessService";
import { unlockedTemplateService } from "../../../src/services/commons/unlockedTemplateService";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../src/services/errors";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { prismaTest } from "../../../lib/prismaTest";

describe("templateAccess rules", () => {
	it("lists only active templates in catalog", () => {
		expect(isListedInCatalog({ isActive: true })).toBe(true);
		expect(isListedInCatalog({ isActive: false })).toBe(false);
	});

	it("allows create/edit for free and premium without unlock", () => {
		expect(canUseTemplate({ isActive: true, isPremium: false })).toBe(true);
		expect(canUseTemplate({ isActive: true, isPremium: true })).toBe(true);
		expect(reasonCannotUseTemplate({ isActive: true, isPremium: true })).toBeNull();
	});

	it("blocks download for premium without unlock; allows with unlock", () => {
		expect(
			reasonCannotDownloadTemplate({ isActive: true, isPremium: true }, { hasUnlock: false }),
		).toBe("PREMIUM_LOCKED");
		expect(canDownloadTemplate({ isActive: true, isPremium: true }, { hasUnlock: true })).toBe(
			true,
		);
		expect(canDownloadTemplate({ isActive: true, isPremium: false }, { hasUnlock: false })).toBe(
			true,
		);
	});

	it("blocks inactive for create/edit even if unlocked", () => {
		expect(reasonCannotUseTemplate({ isActive: false, isPremium: true })).toBe("INACTIVE");
		expect(canUnlockTemplate({ isActive: false })).toBe(false);
	});

	it("parses unlockGifts JSON contract", () => {
		expect(parseUnlockGifts(null)).toBeNull();
		expect(parseUnlockGifts({ downloadCredits: 2, freeDownloads: 1 })).toEqual({
			downloadCredits: 2,
			freeDownloads: 1,
		});
		expect(parseUnlockGifts({ downloadCredits: -1 })).toBeNull();
	});
});

describe("templateAccessService", () => {
	it("allows using premium template without unlock", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isPremium: true },
		});

		await expect(
			templateAccessService.assertCanUseTemplate(user.id, template.id),
		).resolves.toBeUndefined();
	});

	it("blocks download of premium until unlocked", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isPremium: true },
		});

		await expect(
			templateAccessService.assertCanDownloadTemplate(user.id, template.id),
		).rejects.toThrow(ForbiddenError);

		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});

		await expect(
			templateAccessService.assertCanDownloadTemplate(user.id, template.id),
		).resolves.toBeUndefined();
	});

	it("blocks inactive template for use", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isActive: false },
		});

		await expect(templateAccessService.assertCanUseTemplate(user.id, template.id)).rejects.toThrow(
			ValidationError,
		);
	});

	it("throws NotFound for unknown template", async () => {
		await expect(templateAccessService.getTemplateAccessFields("missing-template")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("assertCanUnlockTemplate blocks inactive templates", async () => {
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isActive: false },
		});

		await expect(templateAccessService.assertCanUnlockTemplate(template.id)).rejects.toMatchObject({
			message: "Ce modèle n’est pas disponible",
		});
	});

	it("assertCanUnlockTemplate allows active templates", async () => {
		const template = await createTestTemplate();

		await expect(
			templateAccessService.assertCanUnlockTemplate(template.id),
		).resolves.toBeUndefined();
	});

	it("userCanUse reflects active flag", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		expect(await templateAccessService.userCanUse(user.id, template.id)).toBe(true);

		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isActive: false },
		});

		expect(await templateAccessService.userCanUse(user.id, template.id)).toBe(false);
	});

	it("userCanDownload reflects premium unlock", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { isPremium: true },
		});

		expect(await templateAccessService.userCanDownload(user.id, template.id)).toBe(false);

		await unlockedTemplateService.unlockTemplate(user.id, template.id, {
			method: "gift",
		});

		expect(await templateAccessService.userCanDownload(user.id, template.id)).toBe(true);
	});

	it("userCanDownload allows free templates without unlock", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		expect(await templateAccessService.userCanDownload(user.id, template.id)).toBe(true);
	});
});
