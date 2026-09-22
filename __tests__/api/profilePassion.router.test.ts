import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profilePassionRouter", () => {
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
			caller.profilePassion.create({
				title: "Passion 1",
				icon: "🎉",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profilePassion.create({
				title: "Passion 1",
				icon: "🎉",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a passion via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const passion = await caller.profilePassion.create({
			title: "Passion 1",
			icon: "🎉",
			order: 1,
		});

		expect(passion.title).toBe("Passion 1");
		expect(passion.icon).toBe("🎉");
		expect(passion.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profilePassion.create({
				title: "Passion 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePassion.create({
			title: "Same title",
			icon: "🎉",
			order: 1,
		});

		await expect(
			caller.profilePassion.create({
				title: "Same title",
				icon: "🎉",
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns passions ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePassion.create({
			title: "Second",
			icon: "🎉",
			order: 2,
		});
		await caller.profilePassion.create({
			title: "First",
			icon: "🎉",
			order: 1,
		});

		const list = await caller.profilePassion.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a passion", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profilePassion.create({
			title: "Old title",
			icon: "🎉",
			order: 1,
		});

		const updated = await caller.profilePassion.update({
			id: created.id,
			data: { title: "New title", icon: "🎉" },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profilePassion.create({
			title: "Passion 1",
			icon: "🎉",
			order: 1,
		});

		await expect(
			otherCaller.profilePassion.update({
				id: created.id,
				data: { title: "Hack", icon: "🎉" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a passion", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profilePassion.create({
			title: "First",
			icon: "🎉",
			order: 1,
		});
		await caller.profilePassion.create({
			title: "Second",
			icon: "🎉",
			order: 2,
		});

		const moved = await caller.profilePassion.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a passion", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profilePassion.create({
			title: "To delete",
			icon: "🎉",
			order: 1,
		});

		await caller.profilePassion.delete({ id: created.id });

		const list = await caller.profilePassion.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown passion", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profilePassion.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
