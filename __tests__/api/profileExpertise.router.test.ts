import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";
import { Level } from "../../generated/prisma/enums";

describe("profileExpertiseRouter", () => {
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
			caller.profileExpertise.create({
				title: "Expertise 1",
				level: Level.Débutant,
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileExpertise.create({
				title: "Expertise 1",
				level: Level.Débutant,
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a expertise via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const expertise = await caller.profileExpertise.create({
			title: "Expertise 1",
			level: Level.Débutant,
			order: 1,
		});

		expect(expertise.title).toBe("Expertise 1");
		expect(expertise.level).toBe(Level.Débutant);
		expect(expertise.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileExpertise.create({
				title: "Expertise 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileExpertise.create({
			title: "Same title",
			level: Level.Débutant,
			order: 1,
		});

		await expect(
			caller.profileExpertise.create({
				title: "Same title",
				level: Level.Débutant,
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns expertises ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileExpertise.create({
			title: "Second",
			level: Level.Débutant,
			order: 2,
		});
		await caller.profileExpertise.create({
			title: "First",
			level: Level.Débutant,
			order: 1,
		});

		const list = await caller.profileExpertise.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a expertise", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileExpertise.create({
			title: "Old title",
			level: Level.Débutant,
			order: 1,
		});

		const updated = await caller.profileExpertise.update({
			id: created.id,
			data: { title: "New title", level: Level.Débutant },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileExpertise.create({
			title: "Expertise 1",
			level: Level.Débutant,
			order: 1,
		});

		await expect(
			otherCaller.profileExpertise.update({
				id: created.id,
				data: { title: "Hack", level: Level.Débutant },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a expertise", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileExpertise.create({
			title: "First",
			level: Level.Débutant,
			order: 1,
		});
		await caller.profileExpertise.create({
			title: "Second",
			level: Level.Débutant,
			order: 2,
		});

		const moved = await caller.profileExpertise.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a expertise", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileExpertise.create({
			level: Level.Débutant,
			title: "To delete",
			order: 1,
		});

		await caller.profileExpertise.delete({ id: created.id });

		const list = await caller.profileExpertise.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown expertise", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profileExpertise.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
