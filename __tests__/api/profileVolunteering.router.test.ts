import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("profileVolunteeringRouter", () => {
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
			caller.profileVolunteering.create({
				title: "Volunteering 1",
				organisation: "Organisation 1",
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
			caller.profileVolunteering.create({
				title: "Volunteering 1",
				organisation: "Organisation 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a volunteering via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const volunteering = await caller.profileVolunteering.create({
			title: "Volunteering 1",
			organisation: "Organisation 1",
			start: new Date("2020-01-01"),
			end: new Date("2024-01-01"),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organisation 1");
		expect(volunteering.start).toStrictEqual(new Date("2020-01-01"));
		expect(volunteering.end).toStrictEqual(new Date("2024-01-01"));
		expect(volunteering.location).toBe("Location 1");
		expect(volunteering.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileVolunteering.create({
				title: "Volunteering 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONICT when volunteering already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileVolunteering.create({
			title: "Same volunteering",
			organisation: "Organisation 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		await expect(
			caller.profileVolunteering.create({
				title: "Same volunteering",
				organisation: "Organisation 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns volunteering ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileVolunteering.create({
			title: "Volunteering 1",
			organisation: "Organisation 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});
		await caller.profileVolunteering.create({
			title: "Volunteering 2",
			organisation: "Organisation 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 2,
		});

		const list = await caller.profileVolunteering.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("Volunteering 1");
		expect(list[1]?.title).toBe("Volunteering 2");
	});

	it("update updates a volunteering", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileVolunteering.create({
			title: "Old volunteering",
			organisation: "Organisation 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		const updated = await caller.profileVolunteering.update({
			id: created.id,
			data: {
				title: "New volunteering",
				organisation: "Organisation 1",
				start: new Date(),
				end: new Date(),
				location: "Location 1",
				missions: [],
			},
		});

		expect(updated.title).toBe("New volunteering");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileVolunteering.create({
			title: "Project 1",
			organisation: "Organisation 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		await expect(
			otherCaller.profileVolunteering.update({
				id: created.id,
				data: {
					title: "Hack",
					start: new Date(),
					end: new Date(),
					location: "Location 1",
					missions: [],
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a volunteering", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileVolunteering.create({
			title: "First",
			organisation: "Organisation 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});
		await caller.profileVolunteering.create({
			title: "Volunteering 2",
			organisation: "Organisation 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 2,
		});

		const moved = await caller.profileVolunteering.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a volunteering", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileVolunteering.create({
			title: "To delete",
			organisation: "Organisation 1",
			start: new Date(),
			end: new Date(),
			location: "Location 1",
			missions: [],
			order: 1,
		});

		await caller.profileVolunteering.delete({ id: created.id });

		const list = await caller.profileVolunteering.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown volunteering", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profileVolunteering.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
