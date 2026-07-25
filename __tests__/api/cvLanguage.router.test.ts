import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { Level } from "../../generated/prisma/enums";

describe("cvLanguageRouter", () => {
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
			caller.cvLanguage.create({
				cvId: cv.id,
				data: {
					name: "Language 1",
					level: Level.Débutant,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a language via tRPC", async () => {
		const { caller, cv } = await setup();

		const language = await caller.cvLanguage.create({
			cvId: cv.id,
			data: {
				name: "Language 1",
				level: Level.Débutant,
				order: 1,
			},
		});

		expect(language.cvId).toBe(cv.id);
		expect(language.name).toBe("Language 1");
		expect(language.level).toBe(Level.Débutant);
		expect(language.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvLanguage.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { name: "Language 1" },
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
			caller.cvLanguage.create({
				cvId: cv.id,
				data: {
					name: "Hack",
					level: Level.Débutant,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when name already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvLanguage.create({
			cvId: cv.id,
			data: {
				name: "Same name",
				level: Level.Débutant,
				order: 1,
			},
		});

		await expect(
			caller.cvLanguage.create({
				cvId: cv.id,
				data: {
					name: "Same name",
					level: Level.Débutant,
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns languages ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvLanguage.create({
			cvId: cv.id,
			data: { name: "First", level: Level.Débutant, order: 1 },
		});

		await caller.cvLanguage.create({
			cvId: cv.id,
			data: {
				name: "Second",
				level: Level.Débutant,
				order: 2,
			},
		});

		const list = await caller.cvLanguage.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.name).toBe("First");
		expect(list[1]?.name).toBe("Second");
	});

	it("update updates a language", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvLanguage.create({
			cvId: cv.id,
			data: {
				name: "Old name",
				level: Level.Débutant,
				order: 1,
			},
		});

		const updated = await caller.cvLanguage.update({
			id: created.id,
			data: { name: "New name", level: Level.Débutant },
		});

		expect(updated.name).toBe("New name");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvLanguage.create({
			cvId: cv.id,
			data: {
				name: "Language 1",
				level: Level.Débutant,
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvLanguage.update({
				id: created.id,
				data: { name: "Hack", level: Level.Débutant },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a language", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvLanguage.create({
			cvId: cv.id,
			data: { name: "First", level: Level.Débutant, order: 1 },
		});
		await caller.cvLanguage.create({
			cvId: cv.id,
			data: {
				name: "Second",
				level: Level.Débutant,
				order: 2,
			},
		});

		const moved = await caller.cvLanguage.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a language", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvLanguage.create({
			cvId: cv.id,
			data: {
				name: "To delete",
				level: Level.Débutant,
				order: 1,
			},
		});

		await caller.cvLanguage.delete({ id: created.id });

		const list = await caller.cvLanguage.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown language", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvLanguage.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
