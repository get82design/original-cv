import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("cvPassionRouter", () => {
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
			caller.cvPassion.create({
				cvId: cv.id,
				data: {
					title: "Passion 1",
					icon: "🎉",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a passion via tRPC", async () => {
		const { caller, cv } = await setup();

		const passion = await caller.cvPassion.create({
			cvId: cv.id,
			data: {
				title: "Passion 1",
				icon: "🎉",
				order: 1,
			},
		});

		expect(passion.cvId).toBe(cv.id);
		expect(passion.title).toBe("Passion 1");
		expect(passion.icon).toBe("🎉");
		expect(passion.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvPassion.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Passion 1" },
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
			caller.cvPassion.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					icon: "🎉",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvPassion.create({
			cvId: cv.id,
			data: {
				title: "Same title",
				icon: "🎉",
				order: 1,
			},
		});

		await expect(
			caller.cvPassion.create({
				cvId: cv.id,
				data: {
					title: "Same title",
					icon: "🎉",
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns passions ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvPassion.create({
			cvId: cv.id,
			data: { title: "First", icon: "🎉", order: 1 },
		});

		await caller.cvPassion.create({
			cvId: cv.id,
			data: {
				title: "Second",
				icon: "🎉",
				order: 2,
			},
		});

		const list = await caller.cvPassion.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a passion", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvPassion.create({
			cvId: cv.id,
			data: {
				title: "Old title",
				icon: "🎉",
				order: 1,
			},
		});

		const updated = await caller.cvPassion.update({
			id: created.id,
			data: { title: "New title", icon: "🎉" },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvPassion.create({
			cvId: cv.id,
			data: {
				title: "Passion 1",
				icon: "🎉",
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvPassion.update({
				id: created.id,
				data: { title: "Hack", icon: "🎉" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a passion", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvPassion.create({
			cvId: cv.id,
			data: { title: "First", icon: "🎉", order: 1 },
		});
		await caller.cvPassion.create({
			cvId: cv.id,
			data: {
				title: "Second",
				icon: "🎉",
				order: 2,
			},
		});

		const moved = await caller.cvPassion.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a passion", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvPassion.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				icon: "🎉",
				order: 1,
			},
		});

		await caller.cvPassion.delete({ id: created.id });

		const list = await caller.cvPassion.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown passion", async () => {
		const { caller } = await setup();

		await expect(caller.cvPassion.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
