import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profileSkillGroupRouter", () => {
	async function createUserWithProfile() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		return { user, caller };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.profileSkillGroup.create({
				title: "Group 1",
				order: 1,
				skills: [],
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileSkillGroup.create({
				title: "Group 1",
				order: 1,
				skills: [],
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a skill group via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const group = await caller.profileSkillGroup.create({
			title: "Hard skills",
			order: 1,
			skills: [],
		});

		expect(group.title).toBe("Hard skills");
		expect(group.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileSkillGroup.create({
				title: "Group 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileSkillGroup.create({
			title: "Same group",
			order: 1,
			skills: [],
		});

		await expect(
			caller.profileSkillGroup.create({
				title: "Same group",
				order: 2,
				skills: [],
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns groups ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileSkillGroup.create({
			title: "First",
			order: 1,
			skills: [],
		});
		await caller.profileSkillGroup.create({
			title: "Second",
			order: 2,
			skills: [],
		});

		const list = await caller.profileSkillGroup.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a group title", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileSkillGroup.create({
			title: "Old",
			order: 1,
			skills: [],
		});

		const updated = await caller.profileSkillGroup.update({
			id: created.id,
			data: { title: "New" },
		});

		expect(updated.title).toBe("New");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileSkillGroup.create({
			title: "Owned",
			order: 1,
			skills: [],
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.profileSkillGroup.update({
				id: created.id,
				data: { title: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a group", async () => {
		const { caller } = await createUserWithProfile();

		const g1 = await caller.profileSkillGroup.create({
			title: "First",
			order: 1,
			skills: [],
		});
		const g2 = await caller.profileSkillGroup.create({
			title: "Second",
			order: 2,
			skills: [],
		});

		await caller.profileSkillGroup.move({ id: g2.id, newOrder: 1 });

		const list = await caller.profileSkillGroup.findAll();
		expect(list[0]?.id).toBe(g2.id);
		expect(list[1]?.id).toBe(g1.id);
	});

	it("delete deletes a group", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileSkillGroup.create({
			title: "ToDelete",
			order: 1,
			skills: [],
		});

		await caller.profileSkillGroup.delete({ id: created.id });

		const list = await caller.profileSkillGroup.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profileSkillGroup.delete({ id: "unknown-id" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
