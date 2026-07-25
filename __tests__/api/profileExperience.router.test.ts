import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("profileExperienceRouter", () => {
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
			caller.profileExperience.create({
				title: "Experience 1",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileExperience.create({
				title: "Experience 1",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a experience via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const experience = await caller.profileExperience.create({
			title: "Experience 1",
			company: "Company 1",
			description: "Description 1",
			start: new Date("2020-01-01"),
			end: new Date("2024-01-01"),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.description).toBe("Description 1");
		expect(experience.start).toStrictEqual(new Date("2020-01-01"));
		expect(experience.end).toStrictEqual(new Date("2024-01-01"));
		expect(experience.location).toBe("Location 1");
		expect(experience.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileExperience.create({
				title: "Experience 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONICT when experience already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileExperience.create({
			title: "Same experience",
			company: "Company 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		await expect(
			caller.profileExperience.create({
				title: "Same experience",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns experience ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileExperience.create({
			title: "Experience 1",
			company: "Company 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});
		await caller.profileExperience.create({
			title: "Experience 2",
			company: "Company 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 2,
		});

		const list = await caller.profileExperience.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("Experience 1");
		expect(list[1]?.title).toBe("Experience 2");
	});

	it("update updates a experience", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileExperience.create({
			title: "Old experience",
			company: "Company 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		const updated = await caller.profileExperience.update({
			id: created.id,
			data: {
				title: "New experience",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
			},
		});

		expect(updated.title).toBe("New experience");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileExperience.create({
			title: "Experience 1",
			company: "Company 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		await expect(
			otherCaller.profileExperience.update({
				id: created.id,
				data: {
					title: "Hack",
					company: "Company 1",
					start: new Date(),
					end: new Date(),
					location: "Location 1",
					missions: [],
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a experience", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileExperience.create({
			title: "First",
			company: "Company 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});
		await caller.profileExperience.create({
			title: "Experience 2",
			company: "Company 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 2,
		});

		const moved = await caller.profileExperience.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a experience", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileExperience.create({
			title: "To delete",
			company: "Company 1",
			description: "Description 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		await caller.profileExperience.delete({ id: created.id });

		const list = await caller.profileExperience.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown experience", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profileExperience.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
