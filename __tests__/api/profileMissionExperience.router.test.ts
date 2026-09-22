import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("profileMissionExperienceRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		const experience = await caller.profileExperience.create({
			title: "Experience 1",
			company: "Company 1",
			start: new Date("2020-01-01"),
			missions: [],
			order: 1,
		});

		return { user, caller, experience };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const { experience } = await setup();

		await expect(
			caller.profileMissionExperience.create({
				experienceId: experience.id,
				data: { content: "Mission 1", order: 1 },
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a mission via tRPC", async () => {
		const { caller, experience } = await setup();

		const mission = await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "Développement API", order: 1 },
		});

		expect(mission.experienceId).toBe(experience.id);
		expect(mission.content).toBe("Développement API");
		expect(mission.order).toBe(1);
	});

	it("create rejects invalid input (Zod)", async () => {
		const { caller, experience } = await setup();

		await expect(
			caller.profileMissionExperience.create({
				experienceId: experience.id,
				// @ts-expect-error — test de validation runtime
				data: { content: "Mission" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const { experience } = await setup();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.profileMissionExperience.create({
				experienceId: experience.id,
				data: { content: "Hack", order: 1 },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns NOT_FOUND for unknown experience", async () => {
		const { caller } = await setup();

		await expect(
			caller.profileMissionExperience.create({
				experienceId: "unknown-experience",
				data: { content: "Mission", order: 1 },
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create returns CONFLICT when order already exists", async () => {
		const { caller, experience } = await setup();

		await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "Mission 1", order: 1 },
		});

		await expect(
			caller.profileMissionExperience.create({
				experienceId: experience.id,
				data: { content: "Mission 2", order: 1 },
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByExperienceId returns missions ordered", async () => {
		const { caller, experience } = await setup();

		await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "First", order: 1 },
		});
		await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "Second", order: 2 },
		});

		const list = await caller.profileMissionExperience.findAllByExperienceId({
			experienceId: experience.id,
		});

		expect(list).toHaveLength(2);
		expect(list[0]?.content).toBe("First");
		expect(list[1]?.content).toBe("Second");
	});

	it("update updates mission content", async () => {
		const { caller, experience } = await setup();

		const created = await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "Old", order: 1 },
		});

		const updated = await caller.profileMissionExperience.update({
			id: created.id,
			data: { content: "New" },
		});

		expect(updated.content).toBe("New");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller, experience } = await setup();

		const created = await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "Owned", order: 1 },
		});

		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.profileMissionExperience.update({
				id: created.id,
				data: { content: "Hack" },
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a mission", async () => {
		const { caller, experience } = await setup();

		const m1 = await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "First", order: 1 },
		});
		const m2 = await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "Second", order: 2 },
		});

		await caller.profileMissionExperience.move({ id: m2.id, newOrder: 1 });

		const list = await caller.profileMissionExperience.findAllByExperienceId({
			experienceId: experience.id,
		});

		expect(list[0]?.id).toBe(m2.id);
		expect(list[1]?.id).toBe(m1.id);
	});

	it("delete deletes a mission", async () => {
		const { caller, experience } = await setup();

		const created = await caller.profileMissionExperience.create({
			experienceId: experience.id,
			data: { content: "ToDelete", order: 1 },
		});

		await caller.profileMissionExperience.delete({ id: created.id });

		const list = await caller.profileMissionExperience.findAllByExperienceId({
			experienceId: experience.id,
		});
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown id", async () => {
		const { caller } = await setup();

		await expect(
			caller.profileMissionExperience.delete({ id: "unknown-id" }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
