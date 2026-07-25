import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("colorRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.color.create({ name: "Red", primary: "#FF0000" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a color via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const color = await caller.color.create({
			name: " Red ",
			primary: "#FF0000",
		});

		expect(color.name).toBe("red");
		expect(color.primary).toBe("#FF0000");
	});

	it("create rejects invalid input (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
            // @ts-expect-error — test de validation runtime
			caller.color.create({
				name: "Red",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.color.create({ name: "Red", primary: "#FF0000" });

		await expect(
			caller.color.create({ name: " red ", primary: "#111111" }),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns colors sorted by name", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.color.create({ name: "Red", primary: "#FF0000" });
		await caller.color.create({ name: "Blue", primary: "#0000FF" });

		const list = await caller.color.findAll();

		expect(list).toHaveLength(2);
		expect(list.map((c) => c.name)).toEqual(["blue", "red"]);
	});

	it("findAll returns empty array when no colors", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const list = await caller.color.findAll();

		expect(list).toEqual([]);
	});

	it("findAll returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.color.findAll()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("findById returns a color", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.color.create({
			name: "Green",
			primary: "#00FF00",
		});
		const found = await caller.color.findById({ id: created.id });

		expect(found.id).toBe(created.id);
		expect(found.name).toBe("green");
	});

	it("findById returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.color.findById({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("findByName returns a color or null", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.color.create({ name: "Purple", primary: "#800080" });

		const found = await caller.color.findByName({ name: "purple" });
		const missing = await caller.color.findByName({ name: "orange" });

		expect(found?.name).toBe("purple");
		expect(missing).toBeNull();
	});

	it("update updates a color", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.color.create({
			name: "Yellow",
			primary: "#FFFF00",
		});
		const updated = await caller.color.update({
			id: created.id,
			data: { name: "Gold", primary: "#FFD700" },
		});

		expect(updated.name).toBe("gold");
		expect(updated.primary).toBe("#FFD700");
	});

	it("update returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.color.update({
				id: "unknown-id",
				data: { name: "X" },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("update returns CONFLICT if name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.color.create({ name: "A", primary: "#000001" });
		const b = await caller.color.create({ name: "B", primary: "#000002" });

		await expect(
			caller.color.update({
				id: b.id,
				data: { name: "A" },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("delete deletes a color", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.color.create({
			name: "ToDelete",
			primary: "#123456",
		});
		await caller.color.delete({ id: created.id });

		const list = await caller.color.findAll();
		expect(list.find((c) => c.id === created.id)).toBeUndefined();
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.color.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});