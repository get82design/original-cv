import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("cvPhilosophyRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvPhilosophy.create({
				cvId: cv.id,
				data: { citation: "La citation", author: "L'auteur" },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a philosophy via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const philosophy = await caller.cvPhilosophy.create({
			cvId: cv.id,
			data: {
				citation: "La citation",
				author: "L'auteur",
			},
		});

		expect(philosophy.cvId).toBe(cv.id);
		expect(philosophy.citation).toBe("La citation");
		expect(philosophy.author).toBe("L'auteur");
	});

	it("create philosophy without author", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const philosophy = await caller.cvPhilosophy.create({
			cvId: cv.id,
			data: {
				citation: "La citation",
			},
		});

		expect(philosophy.cvId).toBe(cv.id);
		expect(philosophy.citation).toBe("La citation");
		expect(philosophy.author).toBeNull();
	});

	it("create rejects missing required fields (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvPhilosophy.create({
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
			caller.cvPhilosophy.create({
				cvId: "unknown-cv",
				data: { citation: "La citation", author: "L'auteur" },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns CONFLICT when philosophy already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvPhilosophy.create({
			cvId: cv.id,
			data: { citation: "Premier", author: "L'auteur" },
		});

		await expect(
			caller.cvPhilosophy.create({
				cvId: cv.id,
				data: { citation: "Deuxième", author: "L'auteur" },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const caller = await createTestCaller(createTestSession(otherUser));
		await expect(
			caller.cvPhilosophy.create({
				cvId: cv.id,
				data: { citation: "Hack", author: "L'auteur" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("byCvId returns an existing philosophy", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvPhilosophy.create({
			cvId: cv.id,
			data: { citation: "La citation", author: "L'auteur" },
		});

		const philosophy = await caller.cvPhilosophy.byCvId({ cvId: cv.id });

		expect(philosophy.citation).toBe("La citation");
		expect(philosophy.author).toBe("L'auteur");
	});

	it("byCvId returns NOT_FOUND when philosophy does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvPhilosophy.byCvId({ cvId: cv.id }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("update updates a philosophy via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvPhilosophy.create({
			cvId: cv.id,
			data: { citation: "Ancien citation", author: "Ancien auteur" },
		});

		const updated = await caller.cvPhilosophy.update({
			cvId: cv.id,
			data: { citation: "Nouvelle citation", author: "Nouvel auteur" },
		});

		expect(updated.citation).toBe("Nouvelle citation");
		expect(updated.author).toBe("Nouvel auteur");
	});

	it("update returns NOT_FOUND when philosophy does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvPhilosophy.update({
				cvId: cv.id,
				data: { citation: "Nouvelle citation", author: "Nouvel auteur" },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("delete removes a philosophy", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await caller.cvPhilosophy.create({
			cvId: cv.id,
			data: { citation: "La citation", author: "L'auteur" },
		});

		await caller.cvPhilosophy.delete({ cvId: cv.id });

		await expect(
			caller.cvPhilosophy.byCvId({ cvId: cv.id }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("delete returns NOT_FOUND when philosophy does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvPhilosophy.delete({ cvId: cv.id }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
