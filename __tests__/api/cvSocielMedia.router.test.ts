import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvSocialMediaRouter", () => {
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
			caller.cvSocialMedia.create({
				cvId: cv.id,
				data: {
					socialNetwork: "Passion 1",
					username: "username 1",
					icon: "faGlobe",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a social media via tRPC", async () => {
		const { caller, cv } = await setup();

		const socialMedia = await caller.cvSocialMedia.create({
			cvId: cv.id,
			data: {
				socialNetwork: "Social Network 1",
				username: "username 1",
				icon: "faGlobe",
				order: 1,
			},
		});

		expect(socialMedia.cvId).toBe(cv.id);
		expect(socialMedia.socialNetwork).toBe("Social Network 1");
		expect(socialMedia.username).toBe("username 1");
		expect(socialMedia.icon).toBe("faGlobe");
		expect(socialMedia.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvSocialMedia.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { socialNetwork: "Social Network 1" },
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
			caller.cvSocialMedia.create({
				cvId: cv.id,
				data: {
					socialNetwork: "Hack",
					username: "username 1",
					icon: "faGlobe",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvSocialMedia.create({
			cvId: cv.id,
			data: {
				socialNetwork: "Same social network",
				username: "username 1",
				icon: "faGlobe",
				order: 1,
			},
		});

		await expect(
			caller.cvSocialMedia.create({
				cvId: cv.id,
				data: {
					socialNetwork: "Same social network",
					username: "username 1",
					icon: "faGlobe",
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns social media ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvSocialMedia.create({
			cvId: cv.id,
			data: { socialNetwork: "First", username: "username 1", icon: "faGlobe", order: 1 },
		});

		await caller.cvSocialMedia.create({
			cvId: cv.id,
			data: {
				socialNetwork: "Second",
				username: "username 1",
				icon: "faGlobe",
				order: 2,
			},
		});

		const list = await caller.cvSocialMedia.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.socialNetwork).toBe("First");
		expect(list[1]?.socialNetwork).toBe("Second");
	});

	it("update updates a social media", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvSocialMedia.create({
			cvId: cv.id,
			data: {
				socialNetwork: "Old social network",
				username: "username 1",
				icon: "faGlobe",
				order: 1,
			},
		});

		const updated = await caller.cvSocialMedia.update({
			id: created.id,
			data: { socialNetwork: "New social network", username: "username 1" },
		});

		expect(updated.socialNetwork).toBe("New social network");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvSocialMedia.create({
			cvId: cv.id,
			data: {
				socialNetwork: "Social Network 1",
				username: "username 1",
				icon: "faGlobe",
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvSocialMedia.update({
				id: created.id,
				data: { socialNetwork: "Hack", username: "username 1" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a social media", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvSocialMedia.create({
			cvId: cv.id,
			data: { socialNetwork: "First", username: "username 1", icon: "faGlobe", order: 1 },
		});
		await caller.cvSocialMedia.create({
			cvId: cv.id,
			data: {
				socialNetwork: "Second",
				username: "username 1",	
				icon: "faGlobe",
				order: 2,
			},
		});

		const moved = await caller.cvSocialMedia.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a social media", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvSocialMedia.create({
			cvId: cv.id,
			data: {
				socialNetwork: "To delete",
				username: "username 1",
				icon: "faGlobe",
				order: 1,
			},
		});

		await caller.cvSocialMedia.delete({ id: created.id });

		const list = await caller.cvSocialMedia.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown social media", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvSocialMedia.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
