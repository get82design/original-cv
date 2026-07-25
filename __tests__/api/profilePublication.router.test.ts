import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("profilePublicationRouter", () => {
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
			caller.profilePublication.create({
				title: "Publication 1",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profilePublication.create({
				title: "Publication 1",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a publication via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const publication = await caller.profilePublication.create({
			title: "Publication 1",
			journalName: "Journal Name 1",
			start: new Date("2020-01-01"),
			end: new Date("2024-01-01"),
			url: "https://example.com",
			order: 1,
		});

		expect(publication.title).toBe("Publication 1");
		expect(publication.journalName).toBe("Journal Name 1");
		expect(publication.start).toStrictEqual(new Date("2020-01-01"));
		expect(publication.end).toStrictEqual(new Date("2024-01-01"));
		expect(publication.url).toBe("https://example.com");
		expect(publication.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profilePublication.create({
				title: "Formation 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONICT when publication already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePublication.create({
			title: "Same publication",
			journalName: "Journal Name 1",
			start: new Date(),
			end: new Date(),
			url: "https://example.com",
			order: 1,
		});

		await expect(
			caller.profilePublication.create({
				title: "Same publication",
				journalName: "Journal Name 1",
				start: new Date(),
				end: new Date(),
				url: "https://example.com",
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns publication ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePublication.create({
			title: "Publication 1",
			journalName: "Journal Name 1",
			start: new Date(),
			end: new Date(),
			url: "https://example.com",
			order: 1,
		});
		await caller.profilePublication.create({
			title: "Publication 2",
			journalName: "Journal Name 1",
			start: new Date(),
			end: new Date(),
			url: "https://example.com",
			order: 2,
		});

		const list = await caller.profilePublication.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("Publication 1");
		expect(list[1]?.title).toBe("Publication 2");
	});

	it("update updates a publication", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profilePublication.create({
			title: "Old publication",
			journalName: "Journal Name 1",
			start: new Date(),
			end: new Date(),
			url: "https://example.com",
			order: 1,
		});

		const updated = await caller.profilePublication.update({
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
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profilePublication.create({
			title: "Publication 1",
			journalName: "Journal Name 1",
			start: new Date(),
			end: new Date(),
			url: "https://example.com",
			order: 1,
		});

		await expect(
			otherCaller.profilePublication.update({
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
		const { caller } = await createUserWithProfile();

		const first = await caller.profilePublication.create({
			title: "First",
			journalName: "Journal Name 1",
			start: new Date(),
			end: new Date(),
			url: "https://example.com",
			order: 1,
		});
		await caller.profilePublication.create({
			title: "Publication 2",
			journalName: "Journal Name 1",
			start: new Date(),
			end: new Date(),
			url: "https://example.com",
			order: 2,
		});

		const moved = await caller.profilePublication.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a publication", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profilePublication.create({
			title: "To delete",
			journalName: "Journal Name 1",
			start: new Date(),
			end: new Date(),
			url: "https://example.com",
			order: 1,
		});

		await caller.profilePublication.delete({ id: created.id });

		const list = await caller.profilePublication.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown publication", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profilePublication.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
