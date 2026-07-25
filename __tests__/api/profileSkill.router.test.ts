import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createSkill } from "../utils/create-test-cv-full-flow";
import { createProfileSkillGroup } from "../utils/create-test-user-with-profile";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { Level } from "../../generated/prisma/enums";

describe("profileSkillRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const profile = await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});
		const group = await createProfileSkillGroup(profile.id, "Hard skills", 1);

		return { user, caller, profile, group };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const ownerCaller = await createTestCaller(createTestSession(user));
		const profile = await ownerCaller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});
		const group = await createProfileSkillGroup(profile.id, "Group", 1);
		const skill = await createSkill("React");

		await expect(
			caller.profileSkill.create({
				groupId: group.id,
				data: { level: Level.Intermédiaire, skillId: skill.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a skill in a group via tRPC", async () => {
		const { caller, group } = await setup();
		const skill = await createSkill("TypeScript");

		const item = await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: skill.id, order: 1 },
		});

		expect(item.groupId).toBe(group.id);
		expect(item.skillId).toBe(skill.id);
		expect(item.level).toBe(Level.Intermédiaire);
		expect(item.order).toBe(1);
	});

	it("create rejects invalid input (Zod)", async () => {
		const { caller, group } = await setup();

		await expect(
			caller.profileSkill.create({
				groupId: group.id,
				// @ts-expect-error — test de validation runtime
				data: { skillId: "x" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const { group } = await setup();
		const skill = await createSkill("Hack");

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.profileSkill.create({
				groupId: group.id,
				data: { level: Level.Intermédiaire, skillId: skill.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns NOT_FOUND for unknown group", async () => {
		const { caller } = await setup();
		const skill = await createSkill("Orphan");

		await expect(
			caller.profileSkill.create({
				groupId: "unknown-group",
				data: { level: Level.Intermédiaire, skillId: skill.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns CONICT when skill already in group", async () => {
		const { caller, group } = await setup();
		const skill = await createSkill("Duplicate");

		await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: skill.id, order: 1 },
		});

		await expect(
			caller.profileSkill.create({
				groupId: group.id,
				data: { level: Level.Intermédiaire, skillId: skill.id, order: 2 },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByGroupId returns items ordered", async () => {
		const { caller, group } = await setup();
		const s1 = await createSkill("Alpha");
		const s2 = await createSkill("Beta");

		await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: s1.id, order: 1 },
		});
		await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: s2.id, order: 2 },
		});

		const list = await caller.profileSkill.findAllByGroupId({
			groupId: group.id,
		});

		expect(list).toHaveLength(2);
		expect(list[0]?.skillId).toBe(s1.id);
		expect(list[1]?.skillId).toBe(s2.id);
		expect(list[0]?.skill.name).toBe("Alpha");
	});

	it("update updates skillId", async () => {
		const { caller, group } = await setup();
		const first = await createSkill("Old");
		const second = await createSkill("New");

		const created = await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: first.id, order: 1 },
		});

		const updated = await caller.profileSkill.update({
			id: created.id,
			data: { level: Level.Intermédiaire, skillId: second.id, order: 1 },
		});

		expect(updated.skillId).toBe(second.id);
		expect(updated.skill.name).toBe("New");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller, group } = await setup();
		const skill = await createSkill("Owned");

		const created = await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: skill.id, order: 1 },
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.profileSkill.update({
				id: created.id,
				data: { level: Level.Intermédiaire, skillId: skill.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a skill", async () => {
		const { caller, group } = await setup();
		const s1 = await createSkill("First");
		const s2 = await createSkill("Second");

		const item1 = await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: s1.id, order: 1 },
		});
		const item2 = await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: s2.id, order: 2 },
		});

		await caller.profileSkill.move({ id: item2.id, newOrder: 1 });

		const list = await caller.profileSkill.findAllByGroupId({
			groupId: group.id,
		});

		expect(list[0]?.id).toBe(item2.id);
		expect(list[1]?.id).toBe(item1.id);
	});

	it("delete deletes a skill from group", async () => {
		const { caller, group } = await setup();
		const skill = await createSkill("ToDelete");

		const created = await caller.profileSkill.create({
			groupId: group.id,
			data: { level: Level.Intermédiaire, skillId: skill.id, order: 1 },
		});

		await caller.profileSkill.delete({ id: created.id });

		const list = await caller.profileSkill.findAllByGroupId({
			groupId: group.id,
		});
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(
			caller.profileSkill.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
