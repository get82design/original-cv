import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { Level } from "../../generated/prisma/enums";

describe("profileLanguageRouter", () => {
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
			caller.profileLanguage.create({
				name: "Language 1",
				level: Level.Débutant,
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileLanguage.create({
				name: "Language 1",
				level: Level.Débutant,
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a language via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const language = await caller.profileLanguage.create({
			name: "Language 1",
			level: Level.Débutant,
			order: 1,
		});

		expect(language.name).toBe("Language 1");
		expect(language.level).toBe(Level.Débutant);
		expect(language.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileLanguage.create({
				name: "Language 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when name already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileLanguage.create({
			name: "Same name",
			level: Level.Débutant,
			order: 1,
		});

		await expect(
			caller.profileLanguage.create({
				name: "Same name",
				level: Level.Débutant,
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns languages ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileLanguage.create({
			name: "Second",
			level: Level.Débutant,
			order: 2,
		});
		await caller.profileLanguage.create({
			name: "First",
			level: Level.Débutant,
			order: 1,
		});

		const list = await caller.profileLanguage.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.name).toBe("First");
		expect(list[1]?.name).toBe("Second");
	});

	it("update updates a language", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileLanguage.create({
			name: "Old name",
			level: Level.Débutant,
			order: 1,
		});

		const updated = await caller.profileLanguage.update({
			id: created.id,
			data: { name: "New name", level: Level.Débutant },
		});

		expect(updated.name).toBe("New name");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileLanguage.create({
			name: "Language 1",
			level: Level.Débutant,
			order: 1,
		});

		await expect(
			otherCaller.profileLanguage.update({
				id: created.id,
				data: { name: "Hack", level: Level.Débutant },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a language", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileLanguage.create({
			name: "First",
			level: Level.Débutant,
			order: 1,
		});
		await caller.profileLanguage.create({
			name: "Second",
			level: Level.Débutant,
			order: 2,
		});

		const moved = await caller.profileLanguage.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a language", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileLanguage.create({
			level: Level.Débutant,
			name: "To delete",
			order: 1,
		});

		await caller.profileLanguage.delete({ id: created.id });

		const list = await caller.profileLanguage.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown language", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profileLanguage.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
