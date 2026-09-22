import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("cvCompetenceGroupRouter", () => {
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
			caller.cvCompetenceGroup.create({
				cvId: cv.id,
				data: { title: "Group 1", order: 1, competences: [] },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a competence group via tRPC", async () => {
		const { caller, cv } = await setup();

		const group = await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "Hard skills", order: 1, competences: [] },
		});

		expect(group.cvId).toBe(cv.id);
		expect(group.title).toBe("Hard skills");
		expect(group.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvCompetenceGroup.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Group 1" },
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
			caller.cvCompetenceGroup.create({
				cvId: cv.id,
				data: { title: "Hack", order: 1, competences: [] },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "Same group", order: 1, competences: [] },
		});

		await expect(
			caller.cvCompetenceGroup.create({
				cvId: cv.id,
				data: { title: "Same group", order: 2, competences: [] },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns groups ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "First", order: 1, competences: [] },
		});
		await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "Second", order: 2, competences: [] },
		});

		const list = await caller.cvCompetenceGroup.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a group title", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "Old", order: 1, competences: [] },
		});

		const updated = await caller.cvCompetenceGroup.update({
			id: created.id,
			data: { title: "New" },
		});

		expect(updated.title).toBe("New");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "Owned", order: 1, competences: [] },
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvCompetenceGroup.update({
				id: created.id,
				data: { title: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a group", async () => {
		const { caller, cv } = await setup();

		const g1 = await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "First", order: 1, competences: [] },
		});
		const g2 = await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "Second", order: 2, competences: [] },
		});

		await caller.cvCompetenceGroup.move({ id: g2.id, newOrder: 1 });

		const list = await caller.cvCompetenceGroup.findAllByCvId({ cvId: cv.id });
		expect(list[0]?.id).toBe(g2.id);
		expect(list[1]?.id).toBe(g1.id);
	});

	it("delete deletes a group", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvCompetenceGroup.create({
			cvId: cv.id,
			data: { title: "ToDelete", order: 1, competences: [] },
		});

		await caller.cvCompetenceGroup.delete({ id: created.id });

		const list = await caller.cvCompetenceGroup.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(caller.cvCompetenceGroup.delete({ id: "unknown-id" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
