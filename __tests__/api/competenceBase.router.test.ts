import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import {
	createCompetence,
	createCompetenceGroup,
	addCompetenceToGroup,
	createCV,
} from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("competenceBaseRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.competenceBase.create({ name: "React" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a competence", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const competence = await caller.competenceBase.create({
			name: " React ",
		});

		expect(competence.name).toBe("React");
	});

	it("create returns existing competence if name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const first = await caller.competenceBase.create({ name: "TypeScript" });
		const second = await caller.competenceBase.create({ name: "TypeScript" });

		expect(second.id).toBe(first.id);
	});

	it("create rejects invalid input (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.competenceBase.create({ name: "" }),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("findAll returns competences sorted by name", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.competenceBase.create({ name: "Zig" });
		await caller.competenceBase.create({ name: "Angular" });
		await caller.competenceBase.create({ name: "Nest" });

		const list = await caller.competenceBase.findAll();

		expect(list.map((c) => c.name)).toEqual(["Angular", "Nest", "Zig"]);
	});

	it("findAll returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.competenceBase.findAll()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("update updates a competence", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.competenceBase.create({ name: "Vue" });
		const updated = await caller.competenceBase.update({
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
			caller.competenceBase.update({
				id: "unknown-id",
				data: { name: "X" },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("update returns CONFLICT if name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.competenceBase.create({ name: "A" });
		const b = await caller.competenceBase.create({ name: "B" });

		await expect(
			caller.competenceBase.update({
				id: b.id,
				data: { name: "A" },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("delete deletes a competence", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.competenceBase.create({ name: "ToDelete" });
		await caller.competenceBase.delete({ id: created.id });

		const list = await caller.competenceBase.findAll();
		expect(list.find((c) => c.id === created.id)).toBeUndefined();
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.competenceBase.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("delete returns CONFLICT when competence is used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const group = await createCompetenceGroup(cv.id, "Group", 1);
		const competence = await createCompetence("Used");
		await addCompetenceToGroup(competence.id, group.id);

		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.competenceBase.delete({ id: competence.id }),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});
});
