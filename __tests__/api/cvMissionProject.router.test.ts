import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvMissionProjectRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "Project 1",
				description: "Description 1",
				start: new Date("2020-01-01"),
				missions: [],
				order: 1,
			},
		});
		return { user, caller, cv, project };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(user));
		const project = await ownerCaller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "Project 1",
				description: "Description 1",
				start: new Date("2020-01-01"),
				missions: [],
				order: 1,
			},
		});

		await expect(
			caller.cvMissionProject.create({
				projectId: project.id,
				data: { content: "Project 1", order: 1 },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a mission via tRPC", async () => {
		const { caller, project } = await setup();

		const mission = await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "Développement API", order: 1 },
		});

		expect(mission.cvProjectId).toBe(project.id);
		expect(mission.content).toBe("Développement API");
		expect(mission.order).toBe(1);
	});

	it("create rejects invalid input (Zod)", async () => {
		const { caller, project } = await setup();

		await expect(
			caller.cvMissionProject.create({
				projectId: project.id,
				// @ts-expect-error — test de validation runtime
				data: { content: "Mission" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const { project } = await setup();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvMissionProject.create({
				projectId: project.id,
				data: { content: "Hack", order: 1 },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns NOT_FOUND for unknown project", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvMissionProject.create({
				projectId: "unknown-project",
				data: { content: "Mission", order: 1 },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns CONFLICT when order already exists", async () => {
		const { caller, project } = await setup();

		await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "Mission 1", order: 1 },
		});

		await expect(
			caller.cvMissionProject.create({
				projectId: project.id,
				data: { content: "Mission 2", order: 1 },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByProjectId returns missions ordered", async () => {
		const { caller, project } = await setup();

		await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "First", order: 1 },
		});
		await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "Second", order: 2 },
		});

		const list = await caller.cvMissionProject.findAllByProjectId({
			projectId: project.id,
		});

		expect(list).toHaveLength(2);
		expect(list[0]?.content).toBe("First");
		expect(list[1]?.content).toBe("Second");
	});

	it("update updates mission content", async () => {
		const { caller, project } = await setup();

		const created = await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "Old", order: 1 },
		});

		const updated = await caller.cvMissionProject.update({
			id: created.id,
			data: { content: "New" },
		});

		expect(updated.content).toBe("New");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller, project } = await setup();

		const created = await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "Owned", order: 1 },
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvMissionProject.update({
				id: created.id,
				data: { content: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a mission", async () => {
		const { caller, project } = await setup();

		const m1 = await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "First", order: 1 },
		});
		const m2 = await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "Second", order: 2 },
		});

		await caller.cvMissionProject.move({ id: m2.id, newOrder: 1 });

		const list = await caller.cvMissionProject.findAllByProjectId({
			projectId: project.id,
		});

		expect(list[0]?.id).toBe(m2.id);
		expect(list[1]?.id).toBe(m1.id);
	});

	it("delete deletes a mission", async () => {
		const { caller, project } = await setup();

		const created = await caller.cvMissionProject.create({
			projectId: project.id,
			data: { content: "ToDelete", order: 1 },
		});

		await caller.cvMissionProject.delete({ id: created.id });

		const list = await caller.cvMissionProject.findAllByProjectId({
			projectId: project.id,
		});
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvMissionProject.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
