import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

const modernePayload = {
	name: "Template Moderne",
	structure: { sections: ["header", "skills"] },
	defaultStyles: { color: "#000000" },
};

const classiquePayload = {
	name: "Template Classique",
	structure: { sections: ["header", "experience"] },
	defaultStyles: { color: "#FFFFFF" },
};

describe("cvTemplateRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.cvTemplate.create(modernePayload),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a template via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const template = await caller.cvTemplate.create(modernePayload);

		expect(template.name).toBe("Template Moderne");
		expect(template.structure).toEqual({ sections: ["header", "skills"] });
		expect(template.defaultStyles).toEqual({ color: "#000000" });
	});

	it("create rejects invalid input (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.cvTemplate.create({
				name: "",
				structure: { sections: [] },
				defaultStyles: { color: "#000" },
			}),
		).rejects.toBeInstanceOf(TRPCError);

		await expect(
			caller.cvTemplate.create({
				name: "Bad",
				// @ts-expect-error — test de validation runtime
				structure: { sections: [1] },
				defaultStyles: { color: "#000" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.cvTemplate.create(modernePayload);

		await expect(
			caller.cvTemplate.create(modernePayload),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findById returns a template", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.cvTemplate.create(modernePayload);
		const found = await caller.cvTemplate.findById({ id: created.id });

		expect(found.id).toBe(created.id);
		expect(found.name).toBe("Template Moderne");
	});

	it("findById returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.cvTemplate.findById({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("findById returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.cvTemplate.findById({ id: "any" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("findAll returns templates sorted by name", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.cvTemplate.create(modernePayload);
		await caller.cvTemplate.create(classiquePayload);

		const list = await caller.cvTemplate.findAll();

		expect(list).toHaveLength(2);
		expect(list.map((t) => t.name)).toEqual([
			"Template Classique",
			"Template Moderne",
		]);
	});

	it("findAll returns empty array when no templates", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const list = await caller.cvTemplate.findAll();

		expect(list).toEqual([]);
	});

	it("findAll returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.cvTemplate.findAll()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});
});
