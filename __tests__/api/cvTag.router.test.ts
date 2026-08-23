import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import {
	createTag,
	createTagGroup,
	createCV,
} from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvTagRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const group = await createTagGroup(cv.id, "Hard tags", 1);
		return { user, caller, cv, group };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const group = await createTagGroup(cv.id, "Group", 1);
		const tag = await createTag("React");

		await expect(
			caller.cvTag.create({
				groupId: group.id,
				data: { tagId: tag.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a tag in a group via tRPC", async () => {
		const { caller, group } = await setup();
		const tag = await createTag("TypeScript");

		const item = await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: tag.id, order: 1 },
		});

		expect(item.groupId).toBe(group.id);
		expect(item.tagId).toBe(tag.id);
		expect(item.order).toBe(1);
	});

	it("create rejects invalid input (Zod)", async () => {
		const { caller, group } = await setup();

		await expect(
			caller.cvTag.create({
				groupId: group.id,
				// @ts-expect-error — test de validation runtime
				data: { tagId: "x" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const group = await createTagGroup(cv.id, "Group", 1);
		const tag = await createTag("Hack");
		const caller = await createTestCaller(createTestSession(otherUser));

		await expect(
			caller.cvTag.create({
				groupId: group.id,
				data: { tagId: tag.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns NOT_FOUND for unknown group", async () => {
		const { caller } = await setup();
		const tag = await createTag("Orphan");

		await expect(
			caller.cvTag.create({
				groupId: "unknown-group",
				data: { tagId: tag.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns CONFLICT when tag already in group", async () => {
		const { caller, group } = await setup();
		const tag = await createTag("Duplicate");

		await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: tag.id, order: 1 },
		});

		await expect(
			caller.cvTag.create({
				groupId: group.id,
				data: { tagId: tag.id, order: 2 },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByGroupId returns items ordered", async () => {
		const { caller, group } = await setup();
		const t1 = await createTag("Alpha");
		const t2 = await createTag("Beta");

		await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: t1.id, order: 1 },
		});
		await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: t2.id, order: 2 },
		});

		const list = await caller.cvTag.findAllByGroupId({
			groupId: group.id,
		});

		expect(list).toHaveLength(2);
		expect(list[0]?.tagId).toBe(t1.id);
		expect(list[1]?.tagId).toBe(t2.id);
		expect(list[0]?.tag.name).toBe("Alpha");
	});

	it("update updates tagId", async () => {
		const { caller, group } = await setup();
		const first = await createTag("Old");
		const second = await createTag("New");

		const created = await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: first.id, order: 1 },
		});

		const updated = await caller.cvTag.update({
			id: created.id,
			data: { tagId: second.id },
		});

		expect(updated.tagId).toBe(second.id);
		expect(updated.tag.name).toBe("New");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller, group, user } = await setup();
		const tag = await createTag("Owned");
		const created = await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: tag.id, order: 1 },
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvTag.update({
				id: created.id,
				data: { tagId: tag.id },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });

		expect(user.id).not.toBe(otherUser.id);
	});

	it("move reorders a tag", async () => {
		const { caller, group } = await setup();
		const t1 = await createTag("First");
		const t2 = await createTag("Second");

		const item1 = await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: t1.id, order: 1 },
		});
		const item2 = await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: t2.id, order: 2 },
		});

		await caller.cvTag.move({ id: item2.id, newOrder: 1 });

		const list = await caller.cvTag.findAllByGroupId({
			groupId: group.id,
		});

		expect(list[0]?.id).toBe(item2.id);
		expect(list[1]?.id).toBe(item1.id);
	});

	it("delete deletes a tag from group", async () => {
		const { caller, group } = await setup();
		const tag = await createTag("ToDelete");

		const created = await caller.cvTag.create({
			groupId: group.id,
			data: { tagId: tag.id, order: 1 },
		});

		await caller.cvTag.delete({ id: created.id });

		const list = await caller.cvTag.findAllByGroupId({
			groupId: group.id,
		});
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvTag.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
