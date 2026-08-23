import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvStrengthRouter", () => {
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
			caller.cvStrength.create({
				cvId: cv.id,
				data: {
					title: "Strength 1",
					icon: "FaThumbsUp",
					description: "Description 1",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a social media via tRPC", async () => {
		const { caller, cv } = await setup();

		const strength = await caller.cvStrength.create({
			cvId: cv.id,
			data: {
				title: "Strength 1",
				icon: "FaThumbsUp",
				description: "Description 1",
				order: 1,
			},
		});

		expect(strength.cvId).toBe(cv.id);
		expect(strength.title).toBe("Strength 1");
		expect(strength.icon).toBe("FaThumbsUp");
		expect(strength.description).toBe("Description 1");
		expect(strength.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvStrength.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Strength 1" },
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
			caller.cvStrength.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					icon: "FaThumbsUp",
					description: "Description 1",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvStrength.create({
			cvId: cv.id,
			data: {
				title: "Same strength",
				icon: "FaThumbsUp",
				description: "Description 1",
				order: 1,
			},
		});

		await expect(
			caller.cvStrength.create({
				cvId: cv.id,
				data: {
					title: "Same strength",
					icon: "FaThumbsUp",
					description: "Description 1",
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns strength ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvStrength.create({
			cvId: cv.id,
			data: { title: "First", icon: "FaThumbsUp", description: "Description 1", order: 1 },
		});

		await caller.cvStrength.create({
			cvId: cv.id,
			data: {
				title: "Second",
				icon: "FaThumbsUp",
				description: "Description 1",
				order: 2,
			},
		});

		const list = await caller.cvStrength.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a strength", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvStrength.create({
			cvId: cv.id,
			data: {
				title: "Old strength",
				icon: "FaThumbsUp",
				description: "Description 1",
				order: 1,
			},
		});

		const updated = await caller.cvStrength.update({
			id: created.id,
			data: { title: "New strength", icon: "FaThumbsUp", description: "Description 1" },
		});

		expect(updated.title).toBe("New strength");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvStrength.create({
			cvId: cv.id,
			data: {
				title: "Strength 1",
				icon: "FaThumbsUp",
				description: "Description 1",
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvStrength.update({
				id: created.id,
				data: { title: "Hack", icon: "FaThumbsUp", description: "Description 1" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a strength", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvStrength.create({
			cvId: cv.id,
			data: { title: "First", icon: "FaThumbsUp", description: "Description 1", order: 1 },
		});
		await caller.cvStrength.create({
			cvId: cv.id,
			data: {
				title: "Second",
				icon: "FaThumbsUp",
				description: "Description 1",
				order: 2,
			},
		});

		const moved = await caller.cvStrength.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a social media", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvStrength.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				icon: "FaThumbsUp",
				description: "Description 1",
				order: 1,
			},
		});

		await caller.cvStrength.delete({ id: created.id });

		const list = await caller.cvStrength.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown strength", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvStrength.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
