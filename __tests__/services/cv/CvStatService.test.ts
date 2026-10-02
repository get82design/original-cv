import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvStatService } from "../../../src/services/cv/cvStatService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvStatService.create", () => {
	it("creates a stat", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const stat = await cvStatService.create(cv.id, {
			label: "projets",
			value: "+50",
			order: 1,
		});

		expect(stat.cvId).toBe(cv.id);
		expect(stat.label).toBe("projets");
		expect(stat.value).toBe("+50");
		expect(stat.order).toBe(1);
	});

	it("throws if CV does not exist", async () => {
		await expect(
			cvStatService.create("unknown-cv", {
				label: "projets",
				value: "+50",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if label already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvStatService.create(cv.id, {
			label: "projets",
			value: "+50",
			order: 1,
		});
		await expect(
			cvStatService.create(cv.id, { label: "projets", value: "10", order: 2 }),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvStatService.create(cv.id, {
			label: "projets",
			value: "+50",
			order: 1,
		});
		await expect(
			cvStatService.create(cv.id, { label: "clients", value: "12", order: 1 }),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvStatService.findAllByCvId", () => {
	it("returns stats ordered by order", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvStatService.create(cv.id, { label: "b", value: "2", order: 2 });
		await cvStatService.create(cv.id, { label: "a", value: "1", order: 1 });
		const list = await cvStatService.findAllByCvId(cv.id);
		expect(list.map((s) => s.label)).toEqual(["a", "b"]);
	});
});

describe("CvStatService.update", () => {
	it("updates label and value", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const created = await cvStatService.create(cv.id, {
			label: "projets",
			value: "+50",
			order: 1,
		});
		const updated = await cvStatService.update(created.id, {
			label: "clients",
			value: "12",
		});
		expect(updated.label).toBe("clients");
		expect(updated.value).toBe("12");
	});
});

describe("CvStatService.move", () => {
	it("reorders stats", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const a = await cvStatService.create(cv.id, {
			label: "a",
			value: "1",
			order: 1,
		});
		await cvStatService.create(cv.id, { label: "b", value: "2", order: 2 });
		await cvStatService.move(a.id, 2);
		const list = await cvStatService.findAllByCvId(cv.id);
		expect(list.map((s) => s.label)).toEqual(["b", "a"]);
	});

	it("no-op when same order", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () =>
				cvStatService.create(cv.id, { label: "a", value: "1", order: 1 }),
			moveEntity: (id, newOrder) => cvStatService.move(id, newOrder),
		});
	});
});

describe("CvStatService.delete", () => {
	it("deletes and compact orders", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const a = await cvStatService.create(cv.id, {
			label: "a",
			value: "1",
			order: 1,
		});
		await cvStatService.create(cv.id, { label: "b", value: "2", order: 2 });
		await cvStatService.delete(a.id);
		const list = await cvStatService.findAllByCvId(cv.id);
		expect(list).toHaveLength(1);
		expect(list[0]!.label).toBe("b");
		expect(list[0]!.order).toBe(1);
	});
});
