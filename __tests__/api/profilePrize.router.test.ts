import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profilePrizeRouter", () => {
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
			caller.profilePrize.create({
				title: "Prize 1",
				domaine: "Domaine 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profilePrize.create({
				title: "Prize 1",
				domaine: "Domaine 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a prize via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const prize = await caller.profilePrize.create({
			title: "Prize 1",
			domaine: "Domaine 1",
			order: 1,
		});

		expect(prize.title).toBe("Prize 1");
		expect(prize.domaine).toBe("Domaine 1");
		expect(prize.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profilePrize.create({
				title: "Prize 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePrize.create({
			title: "Same title",
			domaine: "Domaine 1",
			order: 1,
		});

		await expect(
			caller.profilePrize.create({
				title: "Same title",
				domaine: "Domaine 1",
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns prizes ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePrize.create({
			title: "Second",
			domaine: "Domaine 1",
			order: 2,
		});
		await caller.profilePrize.create({
			title: "First",
			domaine: "Domaine 1",
			order: 1,
		});

		const list = await caller.profilePrize.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a prize", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profilePrize.create({
			title: "Old title",
			domaine: "Domaine 1",
			order: 1,
		});

		const updated = await caller.profilePrize.update({
			id: created.id,
			data: { title: "New title", domaine: "Domaine 1" },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profilePrize.create({
			title: "Prize 1",
			domaine: "Domaine 1",
			order: 1,
		});

		await expect(
			otherCaller.profilePrize.update({
				id: created.id,
				data: { title: "Hack", domaine: "Domaine 1" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a prize", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profilePrize.create({
			title: "First",
			domaine: "Domaine 1",
			order: 1,
		});
		await caller.profilePrize.create({
			title: "Second",
			domaine: "Domaine 1",
			order: 2,
		});

		const moved = await caller.profilePrize.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a prize", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profilePrize.create({
			title: "To delete",
			domaine: "Domaine 1",
			order: 1,
		});

		await caller.profilePrize.delete({ id: created.id });

		const list = await caller.profilePrize.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown prize", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profilePrize.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
