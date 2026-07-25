import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvPublicationRouter", () => {
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
			caller.cvPublication.create({
				cvId: cv.id,
				data: {
					title: "Publication 1",
					journalName: "Journal Name 1",
					start: new Date(),
					end: new Date(),
					url: "https://example.com",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a publication via tRPC", async () => {
		const { caller, cv } = await setup();

		const publication = await caller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "Publication 1",
				journalName: "Journal Name 1",
				start: new Date("2020-01-01"),
				end: new Date("2024-01-01"),
				url: "https://example.com",
				order: 1,
			},
		});

		expect(publication.cvId).toBe(cv.id);
		expect(publication.title).toBe("Publication 1");
		expect(publication.journalName).toBe("Journal Name 1");
		expect(publication.start).toStrictEqual(new Date("2020-01-01"));
		expect(publication.end).toStrictEqual(new Date("2024-01-01"));
		expect(publication.url).toBe("https://example.com");
		expect(publication.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvPublication.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Publication 1" },
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
			caller.cvPublication.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					journalName: "Journal Name 1",
					start: new Date(),
					end: new Date(),
					url: "https://example.com",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "Same publication",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 1,
			},
		});

		await expect(
			caller.cvPublication.create({
				cvId: cv.id,
				data: {
					title: "Same publication",
					journalName: "Journal Name 1",
					start: new Date(),
					end: new Date(),
					url: "https://example.com",
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns publication ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "First",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 1,
			},
		});

		await caller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "Second",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 2,
			},
		});

		const list = await caller.cvPublication.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a publication", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "Old publication",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 1,
			},
		});

		const updated = await caller.cvPublication.update({
			id: created.id,
			data: {
				title: "New publication",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
			},
		});

		expect(updated.title).toBe("New publication");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "Publication 1",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvPublication.update({
				id: created.id,
				data: {
					title: "Hack",
					journalName: "Journal Name 1",
					start: new Date(),
					end: new Date(),
					url: "https://example.com",
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a publication", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "First",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 1,
			},
		});
		await caller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "Second",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 2,
			},
		});

		const moved = await caller.cvPublication.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a publication", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvPublication.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 1,
			},
		});

		await caller.cvPublication.delete({ id: created.id });

		const list = await caller.cvPublication.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown publication", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvPublication.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
