import { describe, expect, it } from "vitest";
import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("cvStatRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		return { user, caller, cv };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvStat.create({
				cvId: cv.id,
				data: { label: "projets", value: "+50", order: 1 },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a stat via tRPC", async () => {
		const { caller, cv } = await setup();
		const stat = await caller.cvStat.create({
			cvId: cv.id,
			data: { label: "projets", value: "+50", order: 1 },
		});
		expect(stat.label).toBe("projets");
		expect(stat.cvId).toBe(cv.id);
	});

	it("findAllByCvId / update / move / delete work", async () => {
		const { caller, cv } = await setup();
		const a = await caller.cvStat.create({
			cvId: cv.id,
			data: { label: "a", value: "1", order: 1 },
		});
		await caller.cvStat.create({
			cvId: cv.id,
			data: { label: "b", value: "2", order: 2 },
		});
		await caller.cvStat.update({ id: a.id, data: { value: "99" } });
		await caller.cvStat.move({ id: a.id, newOrder: 2 });
		let list = await caller.cvStat.findAllByCvId({ cvId: cv.id });
		expect(list.map((s) => s.label)).toEqual(["b", "a"]);
		await caller.cvStat.delete({ id: a.id });
		list = await caller.cvStat.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(1);
		expect(list[0]!.label).toBe("b");
	});
});
