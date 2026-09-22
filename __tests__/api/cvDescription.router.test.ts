import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("cvDescriptionRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvDescription.create({
				cvId: cv.id,
				data: { description: "Mon CV" },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a description via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const description = await caller.cvDescription.create({
			cvId: cv.id,
			data: {
				description: "Mon CV",
			},
		});

		expect(description.id).toBeDefined();
		expect(description.cvId).toBe(cv.id);
		expect(description.description).toBe("Mon CV");
	});

	it("create rejects missing required fields (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvDescription.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: {},
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns NOT_FOUND for unknown CV", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.cvDescription.create({
				cvId: "unknown-cv",
				data: { description: "Mon CV" },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const caller = await createTestCaller(createTestSession(otherUser));
		await expect(
			caller.cvDescription.create({
				cvId: cv.id,
				data: { description: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when description already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvDescription.create({
			cvId: cv.id,
			data: { description: "Premier" },
		});

		await expect(
			caller.cvDescription.create({
				cvId: cv.id,
				data: { description: "Deuxième" },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("byCvId returns an existing description", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvDescription.create({
			cvId: cv.id,
			data: { description: "Mon CV" },
		});

		const description = await caller.cvDescription.byCvId({ cvId: cv.id });

		expect(description.description).toBe("Mon CV");
	});

	it("byCvId returns NOT_FOUND when description does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(caller.cvDescription.byCvId({ cvId: cv.id })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("update updates a description via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvDescription.create({
			cvId: cv.id,
			data: { description: "Ancien description" },
		});

		const updated = await caller.cvDescription.update({
			cvId: cv.id,
			data: { description: "Nouveau description" },
		});

		expect(updated.description).toBe("Nouveau description");
	});

	it("delete removes a description", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvDescription.create({
			cvId: cv.id,
			data: { description: "Mon CV" },
		});

		await caller.cvDescription.delete({ cvId: cv.id });

		await expect(caller.cvDescription.byCvId({ cvId: cv.id })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
