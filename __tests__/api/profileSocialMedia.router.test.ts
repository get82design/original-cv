import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("profileSocialMediaRouter", () => {
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
			caller.profileSocialMedia.create({
				socialNetwork: "Social Network 1",
				username: "username 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileSocialMedia.create({
				socialNetwork: "Social Network 1",
				username: "username 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a social media via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const socialMedia = await caller.profileSocialMedia.create({
			socialNetwork: "Social Network 1",
			username: "username 1",
			order: 1,
		});

		expect(socialMedia.socialNetwork).toBe("Social Network 1");
		expect(socialMedia.username).toBe("username 1");
		expect(socialMedia.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileSocialMedia.create({
				socialNetwork: "Social Network 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when social network already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileSocialMedia.create({
			socialNetwork: "Same social network",
			username: "username 1",
			order: 1,
		});

		await expect(
			caller.profileSocialMedia.create({
				socialNetwork: "Same social network",
				username: "username 1",
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns social media ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileSocialMedia.create({
			socialNetwork: "Second",
			username: "username 1",
			order: 2,
		});
		await caller.profileSocialMedia.create({
			socialNetwork: "First",
			username: "username 1",
			order: 1,
		});

		const list = await caller.profileSocialMedia.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.socialNetwork).toBe("First");
		expect(list[1]?.socialNetwork).toBe("Second");
	});

	it("update updates a social media", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileSocialMedia.create({
			socialNetwork: "Old social network",
			username: "username 1",
			order: 1,
		});

		const updated = await caller.profileSocialMedia.update({
			id: created.id,
			data: { socialNetwork: "New social network", username: "username 1" },
		});

		expect(updated.socialNetwork).toBe("New social network");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileSocialMedia.create({
			socialNetwork: "Social Network 1",
			username: "username 1",
			order: 1,
		});

		await expect(
			otherCaller.profileSocialMedia.update({
				id: created.id,
				data: { socialNetwork: "Hack", username: "username 1" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a social media", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileSocialMedia.create({
			socialNetwork: "First",
			username: "username 1",
			order: 1,
		});
		await caller.profileSocialMedia.create({
			socialNetwork: "Second",
			username: "username 1",
			order: 2,
		});

		const moved = await caller.profileSocialMedia.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a social media", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileSocialMedia.create({
			socialNetwork: "To delete",
			username: "username 1",
			order: 1,
		});

		await caller.profileSocialMedia.delete({ id: created.id });

		const list = await caller.profileSocialMedia.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown social media", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profileSocialMedia.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
