import { describe, expect, it } from "vitest";
import { createTestUser } from "../utils/create-test-user";
import { createTestProfile } from "../utils/create-test-profile";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profileStatRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		await expect(
			caller.profileStat.create({
				label: "projets",
				value: "+50",
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a stat via tRPC", async () => {
		const user = await createTestUser();
		await createTestProfile(user.id, "John", "Doe");
		const caller = await createTestCaller(createTestSession(user));
		const stat = await caller.profileStat.create({
			label: "projets",
			value: "+50",
			order: 1,
		});
		expect(stat.label).toBe("projets");
		expect(stat.value).toBe("+50");
	});

	it("findAll returns stats", async () => {
		const user = await createTestUser();
		await createTestProfile(user.id, "John", "Doe");
		const caller = await createTestCaller(createTestSession(user));
		await caller.profileStat.create({ label: "projets", value: "+50", order: 1 });
		const list = await caller.profileStat.findAll();
		expect(list).toHaveLength(1);
	});

	it("update / move / delete work", async () => {
		const user = await createTestUser();
		await createTestProfile(user.id, "John", "Doe");
		const caller = await createTestCaller(createTestSession(user));
		const a = await caller.profileStat.create({ label: "a", value: "1", order: 1 });
		await caller.profileStat.create({ label: "b", value: "2", order: 2 });
		await caller.profileStat.update({ id: a.id, data: { value: "99" } });
		await caller.profileStat.move({ id: a.id, newOrder: 2 });
		await caller.profileStat.delete({ id: a.id });
		const list = await caller.profileStat.findAll();
		expect(list).toHaveLength(1);
		expect(list[0]!.label).toBe("b");
	});
});
