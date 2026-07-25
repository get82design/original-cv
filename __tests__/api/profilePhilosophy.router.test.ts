import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("profilePhilosophyRouter", () => {
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
			caller.profilePhilosophy.create({
				citation: "Ma citation",
				author: "L'auteur",
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profilePhilosophy.create({
				citation: "Ma citation",
				author: "L'auteur",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a philosophy via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const philosophy = await caller.profilePhilosophy.create({
			citation: "Ma citation",
			author: "L'auteur",
		});

		expect(philosophy.citation).toBe("Ma citation");
		expect(philosophy.author).toBe("L'auteur");
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profilePhilosophy.create({
				// @ts-expect-error — test de validation runtime
				citation: undefined,
				author: undefined,
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when philosophy already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePhilosophy.create({
			citation: "Première",
			author: "L'auteur",
		});

		await expect(
			caller.profilePhilosophy.create({
				citation: "Deuxième",
				author: "L'auteur",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("me returns the current philosophy", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePhilosophy.create({
			citation: "Ma citation",
			author: "L'auteur",
		});

		const philosophy = await caller.profilePhilosophy.me();

		expect(philosophy.citation).toBe("Ma citation");
		expect(philosophy.author).toBe("L'auteur");
	});

	it("me returns NOT_FOUND when philosophy does not exist", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profilePhilosophy.me()).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("update updates the philosophy", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePhilosophy.create({
			citation: "Ancienne citation",
			author: "Ancien auteur",
		});

		const updated = await caller.profilePhilosophy.update({
			citation: "Nouvelle citation",
			author: "Nouvel auteur",
		});

		expect(updated.citation).toBe("Nouvelle citation");
		expect(updated.author).toBe("Nouvel auteur");
	});

	it("update returns NOT_FOUND when philosophy does not exist", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			caller.profilePhilosophy.update({
				citation: "Nouvelle citation",
				author: "Nouvel auteur",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("delete removes the philosophy", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profilePhilosophy.create({
			citation: "Ma citation",
			author: "L'auteur",
		});

		await caller.profilePhilosophy.delete();

		await expect(caller.profilePhilosophy.me()).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("delete returns NOT_FOUND when philosophy does not exist", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profilePhilosophy.delete()).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
