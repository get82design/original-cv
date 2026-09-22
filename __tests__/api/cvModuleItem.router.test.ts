import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { CVModuleItemType, CVModuleType } from "../../generated/prisma/enums";
import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("cvModuleItemRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const module = await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "Description",
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});

		const description = await caller.cvDescription.create({
			cvId: cv.id,
			data: { description: "Ma description" },
		});

		return { user, caller, cv, module, description };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const { module, description } = await setup();

		await expect(
			caller.cvModuleItem.create({
				moduleId: module.id,
				data: {
					itemType: CVModuleItemType.cvDescription,
					itemId: description.id,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a module item via tRPC", async () => {
		const { caller, module, description } = await setup();

		const item = await caller.cvModuleItem.create({
			moduleId: module.id,
			data: {
				itemType: CVModuleItemType.cvDescription,
				itemId: description.id,
				order: 1,
			},
		});

		expect(item.moduleId).toBe(module.id);
		expect(item.itemType).toBe(CVModuleItemType.cvDescription);
		expect(item.itemId).toBe(description.id);
		expect(item.order).toBe(1);
	});

	it("create rejects invalid input (Zod)", async () => {
		const { caller, module } = await setup();

		await expect(
			caller.cvModuleItem.create({
				moduleId: module.id,
				// @ts-expect-error — test de validation runtime
				data: { itemType: CVModuleItemType.cvDescription },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const { module, description } = await setup();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvModuleItem.create({
				moduleId: module.id,
				data: {
					itemType: CVModuleItemType.cvDescription,
					itemId: description.id,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns NOT_FOUND for unknown module", async () => {
		const { caller, description } = await setup();

		await expect(
			caller.cvModuleItem.create({
				moduleId: "unknown-module",
				data: {
					itemType: CVModuleItemType.cvDescription,
					itemId: description.id,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns NOT_FOUND when referenced item does not exist", async () => {
		const { caller, module } = await setup();

		await expect(
			caller.cvModuleItem.create({
				moduleId: module.id,
				data: {
					itemType: CVModuleItemType.cvDescription,
					itemId: "unknown-item",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns CONFLICT when item already in module", async () => {
		const { caller, module, description } = await setup();

		await caller.cvModuleItem.create({
			moduleId: module.id,
			data: {
				itemType: CVModuleItemType.cvDescription,
				itemId: description.id,
				order: 1,
			},
		});

		await expect(
			caller.cvModuleItem.create({
				moduleId: module.id,
				data: {
					itemType: CVModuleItemType.cvDescription,
					itemId: description.id,
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByModuleId returns items ordered", async () => {
		const { caller, cv, module, description } = await setup();

		const philosophy = await caller.cvPhilosophy.create({
			cvId: cv.id,
			data: { citation: "Citation" },
		});

		await caller.cvModuleItem.create({
			moduleId: module.id,
			data: {
				itemType: CVModuleItemType.cvDescription,
				itemId: description.id,
				order: 1,
			},
		});
		await caller.cvModuleItem.create({
			moduleId: module.id,
			data: {
				itemType: CVModuleItemType.cvPhilosophy,
				itemId: philosophy.id,
				order: 2,
			},
		});

		const list = await caller.cvModuleItem.findAllByModuleId({
			moduleId: module.id,
		});

		expect(list).toHaveLength(2);
		expect(list[0]?.itemId).toBe(description.id);
		expect(list[1]?.itemId).toBe(philosophy.id);
	});

	it("move reorders a module item", async () => {
		const { caller, cv, module, description } = await setup();

		const philosophy = await caller.cvPhilosophy.create({
			cvId: cv.id,
			data: { citation: "Citation" },
		});

		const item1 = await caller.cvModuleItem.create({
			moduleId: module.id,
			data: {
				itemType: CVModuleItemType.cvDescription,
				itemId: description.id,
				order: 1,
			},
		});
		const item2 = await caller.cvModuleItem.create({
			moduleId: module.id,
			data: {
				itemType: CVModuleItemType.cvPhilosophy,
				itemId: philosophy.id,
				order: 2,
			},
		});

		await caller.cvModuleItem.move({ id: item2.id, newOrder: 1 });

		const list = await caller.cvModuleItem.findAllByModuleId({
			moduleId: module.id,
		});

		expect(list[0]?.id).toBe(item2.id);
		expect(list[1]?.id).toBe(item1.id);
	});

	it("delete deletes a module item", async () => {
		const { caller, module, description } = await setup();

		const created = await caller.cvModuleItem.create({
			moduleId: module.id,
			data: {
				itemType: CVModuleItemType.cvDescription,
				itemId: description.id,
				order: 1,
			},
		});

		await caller.cvModuleItem.delete({ id: created.id });

		const list = await caller.cvModuleItem.findAllByModuleId({
			moduleId: module.id,
		});
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(caller.cvModuleItem.delete({ id: "unknown-id" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
