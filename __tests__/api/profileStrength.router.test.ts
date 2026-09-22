import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profileStrengthRouter", () => {
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
			caller.profileStrength.create({
				title: "Strength 1",
				icon: "💪",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileStrength.create({
				title: "Strength 1",
				icon: "💪",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a strength via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const strength = await caller.profileStrength.create({
			title: "Strength 1",
			icon: "💪",
			order: 1,
		});

		expect(strength.title).toBe("Strength 1");
		expect(strength.icon).toBe("💪");
		expect(strength.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileStrength.create({
				title: "Strength 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when strength already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileStrength.create({
			title: "Same strength",
			icon: "💪",
			order: 1,
		});

		await expect(
			caller.profileStrength.create({
				title: "Same strength",
				icon: "💪",
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns strength ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileStrength.create({
			title: "Second",
			icon: "💪",
			order: 2,
		});
		await caller.profileStrength.create({
			title: "First",
			icon: "💪",
			order: 1,
		});

		const list = await caller.profileStrength.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a strength", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileStrength.create({
			title: "Old strength",
			icon: "💪",
			order: 1,
		});

		const updated = await caller.profileStrength.update({
			id: created.id,
			data: { title: "New strength", icon: "💪" },
		});

		expect(updated.title).toBe("New strength");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileStrength.create({
			title: "Strength 1",
			icon: "💪",
			order: 1,
		});

		await expect(
			otherCaller.profileStrength.update({
				id: created.id,
				data: { title: "Hack", icon: "💪" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a strength", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileStrength.create({
			title: "First",
			icon: "💪",
			order: 1,
		});
		await caller.profileStrength.create({
			title: "Second",
			icon: "💪",
			order: 2,
		});

		const moved = await caller.profileStrength.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a strength", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileStrength.create({
			title: "To delete",
			icon: "💪",
			order: 1,
		});

		await caller.profileStrength.delete({ id: created.id });

		const list = await caller.profileStrength.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown strength", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profileStrength.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
