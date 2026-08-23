import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import {
	createTag,
	addTagToGroup,
	createCV,
	createTagGroup,
} from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("tagBaseRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.tagBase.create({ name: "React" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a tag", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const tag = await caller.tagBase.create({
			name: " React ",
		});

		expect(tag.name).toBe("react");
	});

	it("create returns existing tag if name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const first = await caller.tagBase.create({ name: "TypeScript" });
		const second = await caller.tagBase.create({ name: "TypeScript" });

		expect(second.id).toBe(first.id);
	});

	it("create rejects invalid input (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.tagBase.create({ name: "" })).rejects.toBeInstanceOf(
			TRPCError,
		);
	});

	it("findAll returns tags sorted by name", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.tagBase.create({ name: "Zig" });
		await caller.tagBase.create({ name: "Angular" });
		await caller.tagBase.create({ name: "Nest" });

		const list = await caller.tagBase.findAll();

		expect(list.map((c) => c.name)).toEqual(["angular", "nest", "zig"]);
	});

	it("findAll returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.tagBase.findAll()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("update updates a tag", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.tagBase.create({ name: "Vue" });
		const updated = await caller.tagBase.update({
			id: created.id,
			data: { name: "Vue 3" },
		});

		expect(updated.id).toBe(created.id);
		expect(updated.name).toBe("vue 3");
	});

	it("update returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.tagBase.update({
				id: "unknown-id",
				data: { name: "X" },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("update returns CONFLICT if name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.tagBase.create({ name: "A" });
		const b = await caller.tagBase.create({ name: "B" });

		await expect(
			caller.tagBase.update({
				id: b.id,
				data: { name: "A" },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("delete deletes a tag", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.tagBase.create({ name: "ToDelete" });
		await caller.tagBase.delete({ id: created.id });

		const list = await caller.tagBase.findAll();
		expect(list.find((c) => c.id === created.id)).toBeUndefined();
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.tagBase.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("delete returns CONFLICT when tag is used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const group = await createTagGroup(cv.id, "Group", 1);
		const tag = await createTag("Used");
		await addTagToGroup(tag.id, group.id);

		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.tagBase.delete({ id: tag.id })).rejects.toMatchObject({
			code: "CONFLICT",
		});
	});
});
