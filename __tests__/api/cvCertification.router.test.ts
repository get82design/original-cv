import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvCertificationRouter", () => {
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
			caller.cvCertification.create({
				cvId: cv.id,
				data: {
					title: "Certification 1",
					organismeCertification: "Organisme 1",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a certification via tRPC", async () => {
		const { caller, cv } = await setup();

		const certification = await caller.cvCertification.create({
			cvId: cv.id,
			data: {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
			},
		});

		expect(certification.cvId).toBe(cv.id);
		expect(certification.title).toBe("Certification 1");
		expect(certification.organismeCertification).toBe("Organisme 1");
		expect(certification.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller, cv } = await setup();

		await expect(
			caller.cvCertification.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Certification 1" },
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
			caller.cvCertification.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					organismeCertification: "Organisme 1",
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvCertification.create({
			cvId: cv.id,
			data: {
				title: "Same title",
				organismeCertification: "Organisme 1",
				order: 1,
			},
		});

		await expect(
			caller.cvCertification.create({
				cvId: cv.id,
				data: {
					title: "Same title",
					organismeCertification: "Organisme 1",
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns certifications ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvCertification.create({
			cvId: cv.id,
			data: {
				title: "Second",
				organismeCertification: "Organisme 1",
				order: 2,
			},
		});
		await caller.cvCertification.create({
			cvId: cv.id,
			data: { title: "First", organismeCertification: "Organisme 1", order: 1 },
		});

		const list = await caller.cvCertification.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a certification", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvCertification.create({
			cvId: cv.id,
			data: {
				title: "Old title",
				organismeCertification: "Organisme 1",
				order: 1,
			},
		});

		const updated = await caller.cvCertification.update({
			id: created.id,
			data: { title: "New title", organismeCertification: "Organisme 1" },
		});

		expect(updated.title).toBe("New title");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvCertification.create({
			cvId: cv.id,
			data: {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvCertification.update({
				id: created.id,
				data: { title: "Hack", organismeCertification: "Organisme 1" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a certification", async () => {
		const { caller, cv } = await setup();

		const first = await caller.cvCertification.create({
			cvId: cv.id,
			data: { title: "First", organismeCertification: "Organisme 1", order: 1 },
		});
		await caller.cvCertification.create({
			cvId: cv.id,
			data: {
				title: "Second",
				organismeCertification: "Organisme 1",
				order: 2,
			},
		});

		const moved = await caller.cvCertification.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a certification", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvCertification.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				organismeCertification: "Organisme 1",
				order: 1,
			},
		});

		await caller.cvCertification.delete({ id: created.id });

		const list = await caller.cvCertification.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown certification", async () => {
		const { caller } = await setup();

		await expect(
			caller.cvCertification.delete({ id: "unknown" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
