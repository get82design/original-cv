import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("cvProjectRouter", () => {
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
			caller.cvProject.create({
				cvId: cv.id,
				data: {
					title: "Project 1",
					description: "Description 1",
					start: new Date(),
					end: new Date(),
					technology: "Technology 1",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a project via tRPC", async () => {
		const { caller, cv } = await setup();

		const project = await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "Project 1",
				description: "Description 1",
				start: new Date("2020-01-01"),
				end: new Date("2024-01-01"),
				technology: "Technology 1",
				order: 1,
			},
		});

		expect(project.cvId).toBe(cv.id);
		expect(project.title).toBe("Project 1");
		expect(project.description).toBe("Description 1");
		expect(project.start).toStrictEqual(new Date("2020-01-01"));
		expect(project.end).toStrictEqual(new Date("2024-01-01"));
		expect(project.technology).toBe("Technology 1");
		expect(project.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvProject.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Project 1" },
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
			caller.cvProject.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					description: "Description 1",
					start: new Date(),
					end: new Date(),
					technology: "Technology 1",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "Same project",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				order: 1,
			},
		});

		await expect(
			caller.cvProject.create({
				cvId: cv.id,
				data: {
					title: "Same project",
					description: "Description 1",
					start: new Date(),
					end: new Date(),
					technology: "Technology 1",
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns project ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "First",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				order: 1,
			},
		});

		await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "Second",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				order: 2,
			},
		});

		const list = await caller.cvProject.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a project", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "Old project",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				order: 1,
			},
		});

		const updated = await caller.cvProject.update({
			id: created.id,
			data: {
				title: "New project",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				missions: [],
			},
		});

		expect(updated.title).toBe("New project");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "Project 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				missions: [],
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvProject.update({
				id: created.id,
				data: {
					title: "Hack",
					description: "Description 1",
					start: new Date(),
					end: new Date(),
					technology: "Technology 1",
					missions: [],
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a project", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "First",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				missions: [],
				order: 1,
			},
		});
		await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "Second",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				missions: [],
				order: 2,
			},
		});

		const moved = await caller.cvProject.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a project", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvProject.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				missions: [],
				order: 1,
			},
		});

		await caller.cvProject.delete({ id: created.id });

		const list = await caller.cvProject.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown project", async () => {
		const { caller } = await setup();

		await expect(caller.cvProject.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
