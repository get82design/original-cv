import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvAchievementRouter", () => {
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
			caller.cvAchievement.create({
				cvId: cv.id,
				data: { title: "Achievement 1", order: 1 },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates an achievement via tRPC", async () => {
		const { caller, cv } = await setup();

		const achievement = await caller.cvAchievement.create({
			cvId: cv.id,
			data: {
				title: "Achievement 1",
				description: "Description 1",
				year: 2020,
				technology: "TypeScript",
				order: 1,
			},
		});

		expect(achievement.cvId).toBe(cv.id);
		expect(achievement.title).toBe("Achievement 1");
		expect(achievement.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvAchievement.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Achievement 1" },
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
			caller.cvAchievement.create({
				cvId: cv.id,
				data: { title: "Hack", order: 1 },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvAchievement.create({
			cvId: cv.id,
			data: { title: "Same title", order: 1 },
		});

		await expect(
			caller.cvAchievement.create({
				cvId: cv.id,
				data: { title: "Same title", order: 2 },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns achievements ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvAchievement.create({
			cvId: cv.id,
			data: { title: "Second", order: 2 },
		});
		await caller.cvAchievement.create({
			cvId: cv.id,
			data: { title: "First", order: 1 },
		});

		const list = await caller.cvAchievement.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates an achievement", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvAchievement.create({
			cvId: cv.id,
			data: { title: "Old title", order: 1 },
		});

		const updated = await caller.cvAchievement.update({
			id: created.id,
			data: { title: "New title" },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvAchievement.create({
			cvId: cv.id,
			data: { title: "Achievement 1", order: 1 },
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvAchievement.update({
				id: created.id,
				data: { title: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders an achievement", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvAchievement.create({
			cvId: cv.id,
			data: { title: "First", order: 1 },
		});
		await caller.cvAchievement.create({
			cvId: cv.id,
			data: { title: "Second", order: 2 },
		});

		const moved = await caller.cvAchievement.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes an achievement", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvAchievement.create({
			cvId: cv.id,
			data: { title: "To delete", order: 1 },
		});

		await caller.cvAchievement.delete({ id: created.id });

		const list = await caller.cvAchievement.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown achievement", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvAchievement.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
