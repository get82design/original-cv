import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profileCertificationRouter", () => {
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
			caller.profileCertification.create({
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileCertification.create({
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a certification via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const certification = await caller.profileCertification.create({
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		expect(certification.title).toBe("Certification 1");
		expect(certification.organismeCertification).toBe("Organisme 1");
		expect(certification.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileCertification.create({
				title: "Certification 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileCertification.create({
			title: "Same title",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		await expect(
			caller.profileCertification.create({
				title: "Same title",
				organismeCertification: "Organisme 1",
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns certifications ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileCertification.create({
			title: "Second",
			organismeCertification: "Organisme 1",
			order: 2,
		});
		await caller.profileCertification.create({
			title: "First",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		const list = await caller.profileCertification.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a certification", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileCertification.create({
			title: "Old title",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		const updated = await caller.profileCertification.update({
			id: created.id,
			data: { title: "New title" },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileCertification.create({
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		await expect(
			otherCaller.profileCertification.update({
				id: created.id,
				data: { title: "Hack", organismeCertification: "Organisme 1" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a certification", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileCertification.create({
			title: "First",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		await caller.profileCertification.create({
			title: "Second",
			organismeCertification: "Organisme 1",
			order: 2,
		});

		const moved = await caller.profileCertification.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a certification", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileCertification.create({
			organismeCertification: "Organisme 1",
			title: "To delete",
			order: 1,
		});

		await caller.profileCertification.delete({ id: created.id });

		const list = await caller.profileCertification.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown certification", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profileCertification.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
