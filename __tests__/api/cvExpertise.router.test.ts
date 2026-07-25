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

describe("cvExpertiseRouter", () => {
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
			caller.cvExpertise.create({
				cvId: cv.id,
				data: {
					title: "Expertise 1",
					level: Level.Débutant,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a expertise via tRPC", async () => {
		const { caller, cv } = await setup();

		const expertise = await caller.cvExpertise.create({
			cvId: cv.id,
			data: {
				title: "Expertise 1",
				level: Level.Débutant,
				order: 1,
			},
		});

		expect(expertise.cvId).toBe(cv.id);
		expect(expertise.title).toBe("Expertise 1");
		expect(expertise.level).toBe(Level.Débutant);
		expect(expertise.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvExpertise.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Expertise 1" },
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
			caller.cvExpertise.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					level: Level.Débutant,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvExpertise.create({
			cvId: cv.id,
			data: {
				title: "Same title",
				level: Level.Débutant,
				order: 1,
			},
		});

		await expect(
			caller.cvExpertise.create({
				cvId: cv.id,
				data: {
					title: "Same title",
					level: Level.Débutant,
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns expertises ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvExpertise.create({
			cvId: cv.id,
			data: { title: "First", level: Level.Débutant, order: 1 },
		});

		await caller.cvExpertise.create({
			cvId: cv.id,
			data: {
				title: "Second",
				level: Level.Débutant,
				order: 2,
			},
		});

		const list = await caller.cvExpertise.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a expertise", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvExpertise.create({
			cvId: cv.id,
			data: {
				title: "Old title",
				level: Level.Débutant,
				order: 1,
			},
		});

		const updated = await caller.cvExpertise.update({
			id: created.id,
			data: { title: "New title", level: Level.Débutant },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvExpertise.create({
			cvId: cv.id,
			data: {
				title: "Expertise 1",
				level: Level.Débutant,
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvExpertise.update({
				id: created.id,
				data: { title: "Hack", level: Level.Débutant },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a expertise", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvExpertise.create({
			cvId: cv.id,
			data: { title: "First", level: Level.Débutant, order: 1 },
		});
		await caller.cvExpertise.create({
			cvId: cv.id,
			data: {
				title: "Second",
				level: Level.Débutant,
				order: 2,
			},
		});

		const moved = await caller.cvExpertise.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a expertise", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvExpertise.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				level: Level.Débutant,
				order: 1,
			},
		});

		await caller.cvExpertise.delete({ id: created.id });

		const list = await caller.cvExpertise.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown expertise", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvExpertise.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
