import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvExperienceRouter", () => {
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
			caller.cvExperience.create({
				cvId: cv.id,
				data: {
					title: "Experience 1",
					company: "Company 1",
					description: "Description 1",
					start: new Date(),
					end: new Date(),
					location: "Location 1",
					missions: [],
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a experience via tRPC", async () => {
		const { caller, cv } = await setup();

		const experience = await caller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "Experience 1",
				company: "Company 1",
				description: "Description 1",
				start: new Date("2020-01-01"),
				end: new Date("2024-01-01"),
				location: "Location 1",
				missions: [],
				order: 1,
			},
		});

		expect(experience.cvId).toBe(cv.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.description).toBe("Description 1");
		expect(experience.start).toStrictEqual(new Date("2020-01-01"));
		expect(experience.end).toStrictEqual(new Date("2024-01-01"));
		expect(experience.location).toBe("Location 1");
		expect(experience.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvExperience.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Experience 1" },
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
			caller.cvExperience.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					company: "Company 1",
					description: "Description 1",
					start: new Date(),
					end: new Date(),
					location: "Location 1",
					missions: [],
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "Same experience",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			},
		});

		await expect(
			caller.cvExperience.create({
				cvId: cv.id,
				data: {
					title: "Same experience",
					company: "Company 1",
					description: "Description 1",
					start: new Date(),
					end: new Date(),
					location: "Location 1",
					missions: [],
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns experience ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "First",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			},
		});

		await caller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "Second",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 2,
			},
		});

		const list = await caller.cvExperience.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a experience", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "Old experience",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			},
		});

		const updated = await caller.cvExperience.update({
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
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "Experience 1",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvExperience.update({
				id: created.id,
				data: {
					title: "Hack",
					company: "Company 1",
					description: "Description 1",
					start: new Date(),
					end: new Date(),
					location: "Location 1",
					missions: [],
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a experience", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "First",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			},
		});
		await caller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "Second",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 2,
			},
		});

		const moved = await caller.cvExperience.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a experience", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvExperience.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				company: "Company 1",
				description: "Description 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			},
		});

		await caller.cvExperience.delete({ id: created.id });

		const list = await caller.cvExperience.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown experience", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvExperience.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
