import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { CVModuleType } from "../../generated/prisma/enums";

describe("cvRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const template = await createTestTemplate();

		await expect(
			caller.cv.create({ templateId: template.id, title: "Mon CV" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a CV via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();

		const cv = await caller.cv.create({
			templateId: template.id,
			title: "Mon CV",
		});

		expect(cv.userId).toBe(user.id);
		expect(cv.templateId).toBe(template.id);
		expect(cv.title).toBe("Mon CV");
	});

	it("create rejects missing required fields (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();

		await expect(
			caller.cv.create({
				templateId: template.id,
				// @ts-expect-error — test de validation runtime
				title: undefined,
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("byId returns an existing CV", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id, "Mon CV");

		const result = await caller.cv.byId({ id: cv.id });

		expect(result.id).toBe(cv.id);
		expect(result.title).toBe("Mon CV");
		expect(result.userId).toBe(user.id);
	});

	it("byId returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.cv.byId({ id: "unknown" })).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("byId returns NOT_FOUND for unknown CV", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.cv.byId({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("byId returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const caller = await createTestCaller(createTestSession(otherUser));

		await expect(caller.cv.byId({ id: cv.id })).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("update updates a CV via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id, "Ancien titre");

		const updated = await caller.cv.update({
			id: cv.id,
			data: { title: "Nouveau titre" },
		});

		expect(updated.title).toBe("Nouveau titre");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const caller = await createTestCaller(createTestSession(otherUser));

		await expect(
			caller.cv.update({
				id: cv.id,
				data: { title: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("delete returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const caller = await createTestCaller(createTestSession(otherUser));

		await expect(caller.cv.delete({ id: cv.id })).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
	});

	it("delete returns NOT_FOUND for unknown CV", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.cv.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("findAllByUser returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		await expect(caller.cv.allByUser()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("findAllByUser returns only the current user's CVs", async () => {
		const user = await createTestUser();
		const other = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const mine = await createCV(user.id, template.id, "Mine");
		await createCV(other.id, template.id, "Other");
		const list = await caller.cv.allByUser();
		expect(list).toHaveLength(1);
		expect(list[0]?.id).toBe(mine.id);
	});

	it("create returns BAD_REQUEST when quota is reached", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		await caller.cv.create({ templateId: template.id, title: "CV 1" });
		await expect(
			caller.cv.create({ templateId: template.id, title: "CV 2" }),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});
});

describe("cvRouter.save", () => {
	it("returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const template = await createTestTemplate();
		await expect(
			caller.cv.save({
				templateId: template.id,
				title: "CV Save",
				datas: {},
				modules: [],
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});
	
	it("creates a CV via save", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await caller.cv.save({
			templateId: template.id,
			title: "CV Save",
			datas: {
				header: { title: "John Doe", prenom: "John", nom: "Doe" },
				description: {
					content: { description: "Hello" },
				},
			},
			modules: [
				{
					type: CVModuleType.description,
					order: 1,
					isActive: true,
					settings: {},
				},
			],
		});
		expect(cv.userId).toBe(user.id);
		expect(cv.title).toBe("CV Save");
		expect(cv.headerCv?.title).toBe("John Doe");
		expect(cv.description?.description).toBe("Hello");
	});

	it("returns FORBIDDEN when saving another user's CV", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const caller = await createTestCaller(createTestSession(other));
		await expect(
			caller.cv.save({
				cvId: cv.id,
				templateId: template.id,
				title: "Hack",
				datas: {},
				modules: [],
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("returns BAD_REQUEST when CV limit is reached", async () => {
		const user = await createTestUser(); // maxCvs = 1
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		await createCV(user.id, template.id);
		await expect(
			caller.cv.save({
				templateId: template.id,
				title: "Second CV",
				datas: {},
				modules: [],
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});
	
	it("rejects invalid payload (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		await expect(
			caller.cv.save({
				// @ts-expect-error — test validation runtime
				templateId: undefined,
				title: "CV",
				datas: {},
				modules: [],
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});
});
