import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("profileAchievementRouter", () => {
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
			caller.profileAchievement.create({
				title: "Achievement 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileAchievement.create({
				title: "Achievement 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates an achievement via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const achievement = await caller.profileAchievement.create({
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "TypeScript",
			order: 1,
		});

		expect(achievement.title).toBe("Achievement 1");
		expect(achievement.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileAchievement.create({
				title: "Achievement 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileAchievement.create({
			title: "Same title",
			order: 1,
		});

		await expect(
			caller.profileAchievement.create({
				title: "Same title",
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns achievements ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileAchievement.create({
			title: "Second",
			order: 2,
		});
		await caller.profileAchievement.create({
			title: "First",
			order: 1,
		});

		const list = await caller.profileAchievement.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates an achievement", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileAchievement.create({
			title: "Old title",
			order: 1,
		});

		const updated = await caller.profileAchievement.update({
			id: created.id,
			data: { title: "New title" },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileAchievement.create({
			title: "Achievement 1",
			order: 1,
		});

		await expect(
			otherCaller.profileAchievement.update({
				id: created.id,
				data: { title: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders an achievement", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileAchievement.create({
			title: "First",
			order: 1,
		});
		await caller.profileAchievement.create({
			title: "Second",
			order: 2,
		});

		const moved = await caller.profileAchievement.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes an achievement", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileAchievement.create({
			title: "To delete",
			order: 1,
		});

		await caller.profileAchievement.delete({ id: created.id });

		const list = await caller.profileAchievement.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown achievement", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profileAchievement.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
