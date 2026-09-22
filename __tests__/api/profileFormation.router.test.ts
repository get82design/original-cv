import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";
import { CvTimelineStatus } from "../../generated/prisma/enums";

describe("profileFormationRouter", () => {
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
			caller.profileFormation.create({
				title: "Formation 1",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileFormation.create({
				title: "Formation 1",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a formation via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const formation = await caller.profileFormation.create({
			title: "Formation 1",
			organismeFormation: "Organisme Formation 1",
			start: new Date("2020-01-01"),
			end: new Date("2024-01-01"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		expect(formation.title).toBe("Formation 1");
		expect(formation.organismeFormation).toBe("Organisme Formation 1");
		expect(formation.start).toStrictEqual(new Date("2020-01-01"));
		expect(formation.end).toStrictEqual(new Date("2024-01-01"));
		expect(formation.status).toBe(CvTimelineStatus.COMPLETED);
		expect(formation.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileFormation.create({
				title: "Formation 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when formation already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileFormation.create({
			title: "Same formation",
			organismeFormation: "Organisme Formation 1",
			start: new Date(),
			end: new Date(),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		await expect(
			caller.profileFormation.create({
				title: "Same formation",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns formation ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileFormation.create({
			title: "Formation 1",
			organismeFormation: "Organisme Formation 1",
			start: new Date(),
			end: new Date(),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await caller.profileFormation.create({
			title: "Formation 2",
			organismeFormation: "Organisme Formation 1",
			start: new Date(),
			end: new Date(),
			status: CvTimelineStatus.COMPLETED,
			order: 2,
		});

		const list = await caller.profileFormation.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("Formation 1");
		expect(list[1]?.title).toBe("Formation 2");
	});

	it("update updates a formation", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileFormation.create({
			title: "Old formation",
			organismeFormation: "Organisme Formation 1",
			start: new Date(),
			end: new Date(),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		const updated = await caller.profileFormation.update({
			id: created.id,
			data: {
				title: "New formation",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
			},
		});

		expect(updated.title).toBe("New formation");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileFormation.create({
			title: "Formation 1",
			organismeFormation: "Organisme Formation 1",
			start: new Date(),
			end: new Date(),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		await expect(
			otherCaller.profileFormation.update({
				id: created.id,
				data: {
					title: "Hack",
					organismeFormation: "Organisme Formation 1",
					start: new Date(),
					end: new Date(),
					status: CvTimelineStatus.COMPLETED,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a formation", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileFormation.create({
			title: "First",
			organismeFormation: "Organisme Formation 1",
			start: new Date(),
			end: new Date(),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await caller.profileFormation.create({
			title: "Education 2",
			organismeFormation: "Organisme Formation 1",
			start: new Date(),
			end: new Date(),
			status: CvTimelineStatus.COMPLETED,
			order: 2,
		});

		const moved = await caller.profileFormation.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a formation", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileFormation.create({
			title: "To delete",
			organismeFormation: "Organisme Formation 1",
			start: new Date(),
			end: new Date(),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		await caller.profileFormation.delete({ id: created.id });

		const list = await caller.profileFormation.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown formation", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profileFormation.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
