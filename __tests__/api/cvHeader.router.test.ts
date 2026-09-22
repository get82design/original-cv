import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("cvHeaderRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvHeader.create({
				cvId: cv.id,
				data: { title: "Mon CV" },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a header via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const header = await caller.cvHeader.create({
			cvId: cv.id,
			data: {
				title: "Mon CV",
				prenom: "John",
				nom: "Doe",
				email: "test@test.com",
			},
		});

		expect(header.cvId).toBe(cv.id);
		expect(header.title).toBe("Mon CV");
		expect(header.prenom).toBe("John");
		expect(header.nom).toBe("Doe");
	});

	it("create rejects missing required fields (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvHeader.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { prenom: "John" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns NOT_FOUND for unknown CV", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.cvHeader.create({
				cvId: "unknown-cv",
				data: { title: "Mon CV" },
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
			caller.cvHeader.create({
				cvId: cv.id,
				data: { title: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when header already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvHeader.create({
			cvId: cv.id,
			data: { title: "Premier" },
		});

		await expect(
			caller.cvHeader.create({
				cvId: cv.id,
				data: { title: "Deuxième" },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("byCvId returns an existing header", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvHeader.create({
			cvId: cv.id,
			data: { title: "Mon CV", subtitle: "Dev Fullstack" },
		});

		const header = await caller.cvHeader.byCvId({ cvId: cv.id });

		expect(header.title).toBe("Mon CV");
		expect(header.subtitle).toBe("Dev Fullstack");
	});

	it("byCvId returns NOT_FOUND when header does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(caller.cvHeader.byCvId({ cvId: cv.id })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("update updates a header via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvHeader.create({
			cvId: cv.id,
			data: { title: "Ancien titre" },
		});

		const updated = await caller.cvHeader.update({
			cvId: cv.id,
			data: { title: "Nouveau titre", location: "Paris" },
		});

		expect(updated.title).toBe("Nouveau titre");
		expect(updated.location).toBe("Paris");
	});

	it("delete removes a header", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvHeader.create({
			cvId: cv.id,
			data: { title: "Mon CV" },
		});

		await caller.cvHeader.delete({ cvId: cv.id });

		await expect(caller.cvHeader.byCvId({ cvId: cv.id })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
