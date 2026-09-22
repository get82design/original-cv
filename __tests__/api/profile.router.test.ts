import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profileRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.profile.create({
				firstName: "John",
				lastName: "Doe",
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a profile via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const profile = await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
			phone: "0606060606",
			location: "Paris",
		});

		expect(profile.userId).toBe(user.id);
		expect(profile.firstName).toBe("John");
		expect(profile.lastName).toBe("Doe");
		expect(profile.phone).toBe("0606060606");
		expect(profile.location).toBe("Paris");
	});

	it("create rejects missing required fields (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profile.create({
				firstName: "John",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when profile already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		await expect(
			caller.profile.create({
				firstName: "Jane",
				lastName: "Doe",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("me returns null when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const profile = await caller.profile.me();

		expect(profile).toBeNull();
	});

	it("me returns the current user profile", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		const profile = await caller.profile.me();

		expect(profile?.userId).toBe(user.id);
		expect(profile?.firstName).toBe("John");
	});

	it("completeMe returns the current user profile", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		const profile = await caller.profile.completeMe();

		expect(profile?.userId).toBe(user.id);
		expect(profile?.firstName).toBe("John");
	});

	it("update updates the current user profile", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		const updated = await caller.profile.update({
			firstName: "Jane",
			location: "Lyon",
		});

		expect(updated.firstName).toBe("Jane");
		expect(updated.location).toBe("Lyon");
		expect(updated.lastName).toBe("Doe");
	});

	it("update returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.profile.update({ firstName: "Jane" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("delete removes the current user profile", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		await caller.profile.delete();

		const profile = await caller.profile.me();
		expect(profile).toBeNull();
	});

	it("delete returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.profile.delete()).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("save creates a profile via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const saved = await caller.profile.save({
			firstName: "Ada",
			lastName: "Lovelace",
			phone: "0600000000",
			location: "Londres",
			email: "ada@test.com",
			photo: "ada.png",
		});

		expect(saved.firstName).toBe("Ada");
		expect(saved.lastName).toBe("Lovelace");
		expect(saved.userId).toBe(user.id);
	});
});
