import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("profileProjectRouter", () => {
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
			caller.profileProject.create({
				title: "Project 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileProject.create({
				title: "Project 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a project via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const project = await caller.profileProject.create({
			title: "Project 1",
			description: "Description 1",
			start: new Date("2020-01-01"),
			end: new Date("2024-01-01"),
			technology: "Technology 1",
			order: 1,
		});

		expect(project.title).toBe("Project 1");
		expect(project.description).toBe("Description 1");
		expect(project.start).toStrictEqual(new Date("2020-01-01"));
		expect(project.end).toStrictEqual(new Date("2024-01-01"));
		expect(project.technology).toBe("Technology 1");
		expect(project.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileProject.create({
				title: "Project 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONICT when project already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileProject.create({
			title: "Same project",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			technology: "Technology 1",
			order: 1,
		});

		await expect(
			caller.profileProject.create({
				title: "Same project",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns project ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileProject.create({
			title: "Project 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			technology: "Technology 1",
			order: 1,
		});
		await caller.profileProject.create({
			title: "Project 2",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			technology: "Technology 1",
			order: 2,
		});

		const list = await caller.profileProject.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("Project 1");
		expect(list[1]?.title).toBe("Project 2");
	});

	it("update updates a project", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileProject.create({
			title: "Old project",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			technology: "Technology 1",
			order: 1,
		});

		const updated = await caller.profileProject.update({
			id: created.id,
			data: {
				title: "New project",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				technology: "Technology 1",
			},
		});

		expect(updated.title).toBe("New project");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileProject.create({
			title: "Project 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			technology: "Technology 1",
			order: 1,
		});

		await expect(
			otherCaller.profileProject.update({
				id: created.id,
				data: {
					title: "Hack",
					start: new Date(),
					end: new Date(),
					technology: "Technology 1",
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a project", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileProject.create({
			title: "First",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			technology: "Technology 1",
			order: 1,
		});
		await caller.profileProject.create({
			title: "Project 2",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			technology: "Technology 1",
			order: 2,
		});

		const moved = await caller.profileProject.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a project", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileProject.create({
			title: "To delete",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			technology: "Technology 1",
			order: 1,
		});

		await caller.profileProject.delete({ id: created.id });

		const list = await caller.profileProject.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown project", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profileProject.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
