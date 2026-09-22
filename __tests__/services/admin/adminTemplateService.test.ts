import { describe, expect, it } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import { adminTemplateService } from "../../../src/services/admin/adminTemplateService";
import { NotFoundError, ValidationError } from "../../../src/services/errors";
import { createTestTemplate } from "../../utils/create-test-template";

describe("adminTemplateService", () => {
	it("listTemplates filters by flags and search", async () => {
		const unique = `tpl-filter-${Date.now()}`;
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: {
				name: unique,
				isPremium: true,
				isFeatured: true,
				isActive: true,
			},
		});

		const result = await adminTemplateService.listTemplates({
			search: unique,
			isPremium: true,
			isFeatured: true,
			isActive: true,
			page: 1,
			pageSize: 10,
		});

		expect(result.items.some((t) => t.id === template.id)).toBe(true);
	});

	it("updateCatalog rejects empty patch", async () => {
		const template = await createTestTemplate();
		await expect(adminTemplateService.updateCatalog(template.id, {})).rejects.toBeInstanceOf(
			ValidationError,
		);
	});

	it("updateCatalog rejects negative prices", async () => {
		const template = await createTestTemplate();
		await expect(
			adminTemplateService.updateCatalog(template.id, {
				priceCents: -1,
			}),
		).rejects.toMatchObject({ message: "priceCents doit être ≥ 0" });
		await expect(
			adminTemplateService.updateCatalog(template.id, {
				priceCredits: -1,
			}),
		).rejects.toMatchObject({ message: "priceCredits doit être ≥ 0" });
	});

	it("updateCatalog rejects unknown template", async () => {
		await expect(
			adminTemplateService.updateCatalog("missing-template", {
				isPremium: true,
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it("updateCatalog clears invalid unlockGifts to null", async () => {
		const template = await createTestTemplate();
		await prismaTest.cVTemplate.update({
			where: { id: template.id },
			data: { unlockGifts: { downloadCredits: 2 } },
		});

		const updated = await adminTemplateService.updateCatalog(template.id, {
			// parseUnlockGifts returns null for negative values
			unlockGifts: { downloadCredits: -1 },
		});
		expect(updated.unlockGifts).toBeNull();
	});

	it("getTemplate throws NotFound", async () => {
		await expect(adminTemplateService.getTemplate("missing-template")).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});
});
