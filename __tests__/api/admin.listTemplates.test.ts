import { describe, expect, it } from "vitest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("admin.listTemplates", () => {
	it("rejects non-admin", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(caller.admin.listTemplates({})).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("lists templates with catalog fields for ADMIN", async () => {
		const template = await createTestTemplate();
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const result = await caller.admin.listTemplates({
			page: 1,
			pageSize: 50,
		});
		expect(result.total).toBeGreaterThanOrEqual(1);
		const hit = result.items.find((t) => t.id === template.id);
		expect(hit).toBeTruthy();
		expect(hit?.isActive).toBe(true);
		expect(hit?.isPremium).toBe(false);
		expect(hit?.priceCents).toBeNull();
		expect(hit?.priceCredits).toBeNull();
	});
});

describe("admin.updateTemplateCatalog", () => {
	it("rejects non-admin", async () => {
		const template = await createTestTemplate();
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.admin.updateTemplateCatalog({
				id: template.id,
				isPremium: true,
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("updates premium, price, featured and gifts", async () => {
		const template = await createTestTemplate();
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const updated = await caller.admin.updateTemplateCatalog({
			id: template.id,
			isPremium: true,
			priceCents: 499,
			priceCredits: 3,
			isFeatured: true,
			sortOrder: 2,
			unlockGifts: { downloadCredits: 2, freeDownloads: 1 },
		});

		expect(updated.isPremium).toBe(true);
		expect(updated.priceCents).toBe(499);
		expect(updated.priceCredits).toBe(3);
		expect(updated.isFeatured).toBe(true);
		expect(updated.sortOrder).toBe(2);
		expect(updated.unlockGifts).toEqual({
			downloadCredits: 2,
			freeDownloads: 1,
		});

		const cleared = await caller.admin.updateTemplateCatalog({
			id: template.id,
			isPremium: false,
			unlockGifts: null,
		});
		expect(cleared.isPremium).toBe(false);
		expect(cleared.unlockGifts).toBeNull();
	});

	it("rejects update with no catalog field (Zod refine)", async () => {
		const template = await createTestTemplate();
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		await expect(
			caller.admin.updateTemplateCatalog({ id: template.id }),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: expect.stringContaining(
				"Au moins un champ catalogue à mettre à jour",
			),
		});
	});
});

describe("admin.getTemplate", () => {
	it("returns one template for ADMIN", async () => {
		const template = await createTestTemplate();
		const admin = await createTestUser();
		const caller = await createTestCaller(
			createTestSession({
				id: admin.id,
				email: admin.email,
				role: "ADMIN",
			}),
		);

		const got = await caller.admin.getTemplate({ id: template.id });
		expect(got.id).toBe(template.id);
		expect(got.name).toBe(template.name);
	});
});
