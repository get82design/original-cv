import { describe, expect, it } from "vitest";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { cvModuleService } from "../../../src/services/cv/cvModuleService";
import { CVModuleType } from "../../../generated/prisma/enums";
import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvModuleService.create", () => {
	it("creates a module", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			order: 1,
			settings: {},
		});

		expect(module.cvId).toBe(cv.id);
		expect(module.type).toBe(CVModuleType.description);
		expect(module.order).toBe(1);
	});

	it("throws if CV does not exist", async () => {
		await expect(
			cvModuleService.create("unknown-cv", {
				type: CVModuleType.description,
				order: 1,
				settings: {},
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			order: 1,
			settings: {},
		});
		await expect(
			cvModuleService.create(cv.id, {
				type: CVModuleType.description,
				order: 1,
				settings: {},
			}),
		).rejects.toThrow(ConflictError);
	});

	it("creates another module with different order", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			order: 1,
			settings: {},
		});
		const module2 = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			order: 2,
			settings: {},
		});
		expect(module2.order).toBe(2);
	});
});

describe("CvModuleService.findAllByCvId", () => {
	it("returns modules of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			order: 1,
			settings: {},
		});
		const modules = await cvModuleService.findAllByCvId(cv.id);
		expect(modules.length).toBe(1);
		expect(modules[0]?.cvId).toBe(cv.id);
		expect(modules[0]?.type).toBe(CVModuleType.description);
		expect(modules[0]?.order).toBe(1);
	});

	it("returns empty array if no module exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const modules = await cvModuleService.findAllByCvId(cv.id);
		expect(modules.length).toBe(0);
		expect(modules).toEqual([]);
	});

	it("does not return modules from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const cv2 = await createCV(user.id, template.id);
		await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			order: 1,
			settings: {},
		});
		await cvModuleService.create(cv2.id, {
			type: CVModuleType.description,
			title: "Description 2",
			order: 1,
			settings: {},
		});
		const modules = await cvModuleService.findAllByCvId(cv.id);
		expect(modules.length).toBe(1);
		expect(modules[0]?.cvId).toBe(cv.id);
		expect(modules[0]?.type).toBe(CVModuleType.description);
		expect(modules[0]?.order).toBe(1);
		const modules2 = await cvModuleService.findAllByCvId(cv2.id);
		expect(modules2.length).toBe(1);
		expect(modules2[0]?.cvId).toBe(cv2.id);
		expect(modules2[0]?.type).toBe(CVModuleType.description);
		expect(modules2[0]?.order).toBe(1);
	});
});

describe("CvModuleService.update", () => {
	it("updates a module", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			order: 1,
			settings: {
				title: "Description",
			},
		});
		const updatedModule = await cvModuleService.update(module.id, {
			type: CVModuleType.description,
			title: "Description2",
			settings: {},
		});
		expect(updatedModule.title).toBe("Description2");
		expect(updatedModule.settings).toEqual({});
	});
	it("throws if module does not exist", async () => {
		await expect(
			cvModuleService.update("unknown-module", {
				type: CVModuleType.description,
				title: "Description2",
				settings: {},
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			order: 1,
			settings: {},
		});
		const module2 = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description2",
			order: 2,
			settings: {},
		});
		await expect(
			cvModuleService.update(module.id, {
				type: CVModuleType.description,
				title: "Description2",
				settings: {},
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvModuleService.move", () => {
	it("moves a module to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			order: 1,
			settings: {},
		});
		const module2 = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description2",
			order: 2,
			settings: {},
		});
		await cvModuleService.move(module2.id, 1);
		const result = await cvModuleService.findAllByCvId(cv.id);
		expect(result[0]!.id).toBe(module2.id);
		expect(result[1]!.id).toBe(module.id);
	});

	it("throws if module does not exist", async () => {
		await expect(cvModuleService.move("unknown-module", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			order: 1,
			settings: {},
		});
		await expect(cvModuleService.move(module.id, -1)).rejects.toThrow(
			ValidationError,
		);
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const module = await cvModuleService.create(cv.id, {
					type: CVModuleType.description,
					title: "Description",
					order: 1,
					settings: {},
				});
				return { id: module.id, order: module.order };
			},
			moveEntity: (id, order) => cvModuleService.move(id, order),
		});
	});
});

describe("CvModuleService.delete", () => {
	it("deletes a module", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			order: 1,
			settings: {},
		});
		await cvModuleService.delete(module.id);
		const result = await cvModuleService.findAllByCvId(cv.id);
		expect(result.length).toBe(0);
		expect(result).toEqual([]);
	});
	it("throws if module does not exist", async () => {
		await expect(cvModuleService.delete("unknown-module")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("reorders remaining modules after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			order: 1,
			settings: {},
		});
		const module2 = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description2",
			order: 2,
			settings: {},
		});
		await cvModuleService.delete(module.id);
		const result = await cvModuleService.findAllByCvId(cv.id);
		expect(result.length).toBe(1);
		expect(result[0]!.id).toBe(module2.id);
	});

	it("deletes related module items when deleting module", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const module = await cvModuleService.create(cv.id, {
			type: CVModuleType.description,
			title: "Description",
			order: 1,
			settings: {},
		});
		await cvModuleService.delete(module.id);
		const result = await cvModuleService.findAllByCvId(cv.id);
		expect(result.length).toBe(0);
	});
});
