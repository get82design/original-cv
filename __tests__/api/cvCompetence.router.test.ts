import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import {
	createCompetence,
	createCompetenceGroup,
	createCV,
} from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvCompetenceRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const group = await createCompetenceGroup(cv.id, "Hard skills", 1);
		return { user, caller, cv, group };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const group = await createCompetenceGroup(cv.id, "Group", 1);
		const competence = await createCompetence("React");

		await expect(
			caller.cvCompetence.create({
				groupId: group.id,
				data: { competenceId: competence.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a competence in a group via tRPC", async () => {
		const { caller, group } = await setup();
		const competence = await createCompetence("TypeScript");

		const item = await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: competence.id, order: 1 },
		});

		expect(item.groupId).toBe(group.id);
		expect(item.competenceId).toBe(competence.id);
		expect(item.order).toBe(1);
	});

	it("create rejects invalid input (Zod)", async () => {
		const { caller, group } = await setup();

		await expect(
			caller.cvCompetence.create({
				groupId: group.id,
				// @ts-expect-error — test de validation runtime
				data: { competenceId: "x" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const group = await createCompetenceGroup(cv.id, "Group", 1);
		const competence = await createCompetence("Hack");
		const caller = await createTestCaller(createTestSession(otherUser));

		await expect(
			caller.cvCompetence.create({
				groupId: group.id,
				data: { competenceId: competence.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns NOT_FOUND for unknown group", async () => {
		const { caller } = await setup();
		const competence = await createCompetence("Orphan");

		await expect(
			caller.cvCompetence.create({
				groupId: "unknown-group",
				data: { competenceId: competence.id, order: 1 },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns CONFLICT when competence already in group", async () => {
		const { caller, group } = await setup();
		const competence = await createCompetence("Duplicate");

		await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: competence.id, order: 1 },
		});

		await expect(
			caller.cvCompetence.create({
				groupId: group.id,
				data: { competenceId: competence.id, order: 2 },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByGroupId returns items ordered", async () => {
		const { caller, group } = await setup();
		const c1 = await createCompetence("Alpha");
		const c2 = await createCompetence("Beta");

		await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: c1.id, order: 1 },
		});
		await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: c2.id, order: 2 },
		});

		const list = await caller.cvCompetence.findAllByGroupId({
			groupId: group.id,
		});

		expect(list).toHaveLength(2);
		expect(list[0]?.competenceId).toBe(c1.id);
		expect(list[1]?.competenceId).toBe(c2.id);
		expect(list[0]?.competence.name).toBe("Alpha");
	});

	it("update updates competenceId", async () => {
		const { caller, group } = await setup();
		const first = await createCompetence("Old");
		const second = await createCompetence("New");

		const created = await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: first.id, order: 1 },
		});

		const updated = await caller.cvCompetence.update({
			id: created.id,
			data: { competenceId: second.id },
		});

		expect(updated.competenceId).toBe(second.id);
		expect(updated.competence.name).toBe("New");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller, group, user } = await setup();
		const competence = await createCompetence("Owned");
		const created = await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: competence.id, order: 1 },
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvCompetence.update({
				id: created.id,
				data: { competenceId: competence.id },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });

		expect(user.id).not.toBe(otherUser.id);
	});

	it("move reorders a competence", async () => {
		const { caller, group } = await setup();
		const c1 = await createCompetence("First");
		const c2 = await createCompetence("Second");

		const item1 = await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: c1.id, order: 1 },
		});
		const item2 = await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: c2.id, order: 2 },
		});

		await caller.cvCompetence.move({ id: item2.id, newOrder: 1 });

		const list = await caller.cvCompetence.findAllByGroupId({
			groupId: group.id,
		});

		expect(list[0]?.id).toBe(item2.id);
		expect(list[1]?.id).toBe(item1.id);
	});

	it("delete deletes a competence from group", async () => {
		const { caller, group } = await setup();
		const competence = await createCompetence("ToDelete");

		const created = await caller.cvCompetence.create({
			groupId: group.id,
			data: { competenceId: competence.id, order: 1 },
		});

		await caller.cvCompetence.delete({ id: created.id });

		const list = await caller.cvCompetence.findAllByGroupId({
			groupId: group.id,
		});
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvCompetence.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
