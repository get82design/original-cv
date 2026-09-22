import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profileMissionProjectRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		const project = await caller.profileProject.create({
			title: "Project 1",
			description: "Description 1",
			start: new Date("2020-01-01"),
			missions: [],
			order: 1,
		});

		return { user, caller, project };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const { project } = await setup();

		await expect(
			caller.profileMissionProject.create({
				projectId: project.id,
				data: { content: "Mission 1", order: 1 },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a mission via tRPC", async () => {
		const { caller, project } = await setup();

		const mission = await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "Développement API", order: 1 },
		});

		expect(mission.projectId).toBe(project.id);
		expect(mission.content).toBe("Développement API");
		expect(mission.order).toBe(1);
	});

	it("create rejects invalid input (Zod)", async () => {
		const { caller, project } = await setup();

		await expect(
			caller.profileMissionProject.create({
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
			otherCaller.profileMissionProject.create({
				projectId: project.id,
				data: { content: "Hack", order: 1 },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns NOT_FOUND for unknown project", async () => {
		const { caller } = await setup();

		await expect(
			caller.profileMissionProject.create({
				projectId: "unknown-project",
				data: { content: "Mission", order: 1 },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns CONFLICT when order already exists", async () => {
		const { caller, project } = await setup();

		await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "Mission 1", order: 1 },
		});

		await expect(
			caller.profileMissionProject.create({
				projectId: project.id,
				data: { content: "Mission 2", order: 1 },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByProjectId returns missions ordered", async () => {
		const { caller, project } = await setup();

		await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "First", order: 1 },
		});
		await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "Second", order: 2 },
		});

		const list = await caller.profileMissionProject.findAllByProjectId({
			projectId: project.id,
		});

		expect(list).toHaveLength(2);
		expect(list[0]?.content).toBe("First");
		expect(list[1]?.content).toBe("Second");
	});

	it("update updates mission content", async () => {
		const { caller, project } = await setup();

		const created = await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "Old", order: 1 },
		});

		const updated = await caller.profileMissionProject.update({
			id: created.id,
			data: { content: "New" },
		});

		expect(updated.content).toBe("New");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller, project } = await setup();

		const created = await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "Owned", order: 1 },
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.profileMissionProject.update({
				id: created.id,
				data: { content: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a mission", async () => {
		const { caller, project } = await setup();

		const m1 = await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "First", order: 1 },
		});
		const m2 = await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "Second", order: 2 },
		});

		await caller.profileMissionProject.move({ id: m2.id, newOrder: 1 });

		const list = await caller.profileMissionProject.findAllByProjectId({
			projectId: project.id,
		});

		expect(list[0]?.id).toBe(m2.id);
		expect(list[1]?.id).toBe(m1.id);
	});

	it("delete deletes a mission", async () => {
		const { caller, project } = await setup();

		const created = await caller.profileMissionProject.create({
			projectId: project.id,
			data: { content: "ToDelete", order: 1 },
		});

		await caller.profileMissionProject.delete({ id: created.id });

		const list = await caller.profileMissionProject.findAllByProjectId({
			projectId: project.id,
		});
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(caller.profileMissionProject.delete({ id: "unknown-id" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
