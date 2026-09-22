import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profileDescriptionRouter", () => {
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
			caller.profileDescription.create({
				description: "Ma description",
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileDescription.create({
				description: "Ma description",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a description via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const description = await caller.profileDescription.create({
			description: "Ma description",
		});

		expect(description.description).toBe("Ma description");
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profileDescription.create({
				// @ts-expect-error — test de validation runtime
				description: undefined,
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when description already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileDescription.create({
			description: "Première",
		});

		await expect(
			caller.profileDescription.create({
				description: "Deuxième",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("me returns the current description", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileDescription.create({
			description: "Ma description",
		});

		const description = await caller.profileDescription.me();

		expect(description.description).toBe("Ma description");
	});

	it("me returns NOT_FOUND when description does not exist", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profileDescription.me()).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("update updates the description", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileDescription.create({
			description: "Ancienne description",
		});

		const updated = await caller.profileDescription.update({
			description: "Nouvelle description",
		});

		expect(updated.description).toBe("Nouvelle description");
	});

	it("update returns NOT_FOUND when description does not exist", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profileDescription.update({
				description: "Nouvelle description",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("delete removes the description", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileDescription.create({
			description: "Ma description",
		});

		await caller.profileDescription.delete();

		await expect(caller.profileDescription.me()).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("delete returns NOT_FOUND when description does not exist", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profileDescription.delete()).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
