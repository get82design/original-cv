import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import {
	createSkill,
	createSkillGroup,
	addSkillToGroup,
	createCV,
} from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";
import { Level } from "../../generated/prisma/enums";

describe("skillBaseRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.skillBase.create({ name: "React" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a skill", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const skill = await caller.skillBase.create({
			name: " React ",
		});

		expect(skill.name).toBe("React");
	});

	it("create returns existing skill if name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const first = await caller.skillBase.create({ name: "TypeScript" });
		const second = await caller.skillBase.create({ name: "TypeScript" });

		expect(second.id).toBe(first.id);
	});

	it("create rejects invalid input (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.skillBase.create({ name: "" })).rejects.toBeInstanceOf(
			TRPCError,
		);
	});

	it("findAll returns skills sorted by name", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.skillBase.create({ name: "Zig" });
		await caller.skillBase.create({ name: "Angular" });
		await caller.skillBase.create({ name: "Nest" });

		const list = await caller.skillBase.findAll();

		expect(list.map((c) => c.name)).toEqual(["Angular", "Nest", "Zig"]);
	});

	it("findAll returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.skillBase.findAll()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("update updates a skill", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.skillBase.create({ name: "Vue" });
		const updated = await caller.skillBase.update({
			id: created.id,
			data: { name: "Vue 3" },
		});

		expect(updated.id).toBe(created.id);
		expect(updated.name).toBe("Vue 3");
	});

	it("update returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.skillBase.update({
				id: "unknown-id",
				data: { name: "X" },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("update returns CONFLICT if name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.skillBase.create({ name: "A" });
		const b = await caller.skillBase.create({ name: "B" });

		await expect(
			caller.skillBase.update({
				id: b.id,
				data: { name: "A" },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("delete deletes a skill", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.skillBase.create({ name: "ToDelete" });
		await caller.skillBase.delete({ id: created.id });

		const list = await caller.skillBase.findAll();
		expect(list.find((c) => c.id === created.id)).toBeUndefined();
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.skillBase.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("delete returns CONFLICT when skill is used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const group = await createSkillGroup(cv.id, "Group", 1);
		const skill = await createSkill("Used");
		await addSkillToGroup(skill.id, group.id, Level.Intermédiaire);

		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.skillBase.delete({ id: skill.id }),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});
});
