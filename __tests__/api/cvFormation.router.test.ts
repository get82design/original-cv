import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { CvTimelineStatus } from "../../generated/prisma/enums";

describe("cvFormationRouter", () => {
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
			caller.cvFormation.create({
				cvId: cv.id,
				data: {
					title: "Formation 1",
					organismeFormation: "Organisme Formation 1",
					start: new Date(),
					end: new Date(),
					status: CvTimelineStatus.COMPLETED,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a formation via tRPC", async () => {
		const { caller, cv } = await setup();

		const formation = await caller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "Formation 1",
				organismeFormation: "Organisme Formation 1",
				start: new Date("2020-01-01"),
				end: new Date("2024-01-01"),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		expect(formation.cvId).toBe(cv.id);
		expect(formation.title).toBe("Formation 1");
		expect(formation.organismeFormation).toBe("Organisme Formation 1");
		expect(formation.start).toStrictEqual(new Date("2020-01-01"));
		expect(formation.end).toStrictEqual(new Date("2024-01-01"));
		expect(formation.status).toBe(CvTimelineStatus.COMPLETED);
		expect(formation.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvFormation.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Formation 1" },
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
			caller.cvFormation.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					organismeFormation: "Organisme Formation 1",
					start: new Date(),
					end: new Date(),
					status: CvTimelineStatus.COMPLETED,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "Same formation",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		await expect(
			caller.cvFormation.create({
				cvId: cv.id,
				data: {
					title: "Same formation",
					organismeFormation: "Organisme Formation 1",
					start: new Date(),
					end: new Date(),
					status: CvTimelineStatus.COMPLETED,
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns formation ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "First",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		await caller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "Second",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 2,
			},
		});

		const list = await caller.cvFormation.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a formation", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "Old formation",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		const updated = await caller.cvFormation.update({
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
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "Formation 1",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvFormation.update({
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
		const { caller, cv } = await setup();

		const first = await caller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "First",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});
		await caller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "Second",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 2,
			},
		});

		const moved = await caller.cvFormation.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a formation", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvFormation.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				organismeFormation: "Organisme Formation 1",
				start: new Date(),
				end: new Date(),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		await caller.cvFormation.delete({ id: created.id });

		const list = await caller.cvFormation.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown formation", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvFormation.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
