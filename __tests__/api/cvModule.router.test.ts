import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { CVModuleType } from "../../generated/prisma/enums";
import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("cvModuleRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		return { user, caller, cv };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvModule.create({
				cvId: cv.id,
				data: {
					type: CVModuleType.description,
					order: 1,
					settings: {},
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a module via tRPC", async () => {
		const { caller, cv } = await setup();

		const module = await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "Description",
				type: CVModuleType.description,
				order: 1,
				settings: { color: "#000" },
			},
		});

		expect(module.cvId).toBe(cv.id);
		expect(module.title).toBe("Description");
		expect(module.type).toBe(CVModuleType.description);
		expect(module.order).toBe(1);
		expect(module.settings).toEqual({ color: "#000" });
		expect(module.isActive).toBe(true);
	});

	it("create rejects invalid input (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvModule.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { type: CVModuleType.description },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const caller = await createTestCaller(createTestSession(otherUser));

		await expect(
			caller.cvModule.create({
				cvId: cv.id,
				data: {
					type: CVModuleType.description,
					order: 1,
					settings: {},
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when order already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvModule.create({
			cvId: cv.id,
			data: {
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});

		await expect(
			caller.cvModule.create({
				cvId: cv.id,
				data: {
					type: CVModuleType.philosophy,
					order: 1,
					settings: {},
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("create returns CONFLICT when type already exists", async () => {
		const { caller, cv } = await setup();
		await caller.cvModule.create({
			cvId: cv.id,
			data: {
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});
		await expect(
			caller.cvModule.create({
				cvId: cv.id,
				data: {
					type: CVModuleType.description,
					order: 1,
					settings: {},
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns modules ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "First",
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});
		await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "Second",
				type: CVModuleType.philosophy,
				order: 2,
				settings: {},
			},
		});

		const list = await caller.cvModule.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
		expect(list[0]?.items).toEqual([]);
	});

	it("update updates a module", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "Old",
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});

		const updated = await caller.cvModule.update({
			id: created.id,
			data: {
				title: "New",
				settings: { fontSize: 14 },
			},
		});

		expect(updated.title).toBe("New");
		expect(updated.settings).toEqual({ fontSize: 14 });
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "Owned",
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvModule.update({
				id: created.id,
				data: { title: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("update can set isActive to false", async () => {
		const { caller, cv } = await setup();
		const created = await caller.cvModule.create({
			cvId: cv.id,
			data: {
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});
		const updated = await caller.cvModule.update({
			id: created.id,
			data: { isActive: false },
		});
		expect(updated.isActive).toBe(false);
	});

	it("move reorders a module", async () => {
		const { caller, cv } = await setup();

		const m1 = await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "First",
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});
		const m2 = await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "Second",
				type: CVModuleType.philosophy,
				order: 2,
				settings: {},
			},
		});

		await caller.cvModule.move({ id: m2.id, newOrder: 1 });

		const list = await caller.cvModule.findAllByCvId({ cvId: cv.id });
		expect(list[0]?.id).toBe(m2.id);
		expect(list[1]?.id).toBe(m1.id);
	});

	it("delete deletes a module", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvModule.create({
			cvId: cv.id,
			data: {
				title: "ToDelete",
				type: CVModuleType.description,
				order: 1,
				settings: {},
			},
		});

		await caller.cvModule.delete({ id: created.id });

		const list = await caller.cvModule.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(caller.cvModule.delete({ id: "unknown-id" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
