import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { profileProjectService } from "../../../src/services/profile/profileProjectService";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileMissionProjectService } from "../../../src/services/profile/profileMissionProjectService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileMissionProjectService.create", () => {
	// TEST 1 : création d'une mission
	it("creates a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission = await profileMissionProjectService.create(project.id, {
			content: "Développement API REST",
			order: 1,
		});

		expect(mission.projectId).toBe(project.id);
		expect(mission.content).toBe("Développement API REST");
		expect(mission.order).toBe(1);
	});

	it("throws if project does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await expect(
			profileMissionProjectService.create("invalid-project-id", {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order already exists for project", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await profileMissionProjectService.create(project.id, {
			content: "Développement API REST",
			order: 1,
		});

		await expect(
			profileMissionProjectService.create(project.id, {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileMissionProjectService.findAllByProfileProjectId", () => {
	// TEST 1 : recherche par Profile
	it("returns missions project of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});

		const missions =
			await profileMissionProjectService.findAllByProfileProjectId(project.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 1");
		expect(missions[0]?.order).toBe(1);
	});

	it("returns empty array if no mission project exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const missions =
			await profileMissionProjectService.findAllByProfileProjectId(project.id);
		expect(missions).toHaveLength(0);
	});

	it("does not return missions project from another project", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const projectA = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const projectB = await profileProjectService.create(profile.id, {
			title: "Projet 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileMissionProjectService.create(projectA.id, {
			content: "Mission 1",
			order: 1,
		});
		await profileMissionProjectService.create(projectB.id, {
			content: "Mission 2",
			order: 1,
		});
		const missions =
			await profileMissionProjectService.findAllByProfileProjectId(projectB.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});

describe("ProfileMissionProjectService.update", () => {
	// TEST 1 : mise à jour d'une mission
	it("updates a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await profileMissionProjectService.update(
			mission.id,
			{
				content: "Mission 2",
			},
		);
		expect(updatedMission.content).toBe("Mission 2");
	});

	it("throws if mission does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(
			profileMissionProjectService.update("invalid-mission-id", {
				content: "Mission 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("keeps order unchanged when updating content", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await profileMissionProjectService.update(
			mission.id,
			{
				content: "Mission 2",
			},
		);
		expect(updatedMission.order).toBe(1);
	});
});

describe("ProfileMissionProjectService.move", () => {
	// TEST 1 : déplacement d'une mission
	it("moves a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission1 = await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});

		const mission2 = await profileMissionProjectService.create(project.id, {
			content: "Mission 2",
			order: 2,
		});

		await profileMissionProjectService.move(mission1.id, 2);

		const result = await profileMissionProjectService.findAllByProfileProjectId(
			project.id,
		);

		expect(result[0]!.content).toBe("Mission 2");
		expect(result[1]!.content).toBe("Mission 1");
	});

	it("throws if missions project does not exist", async () => {
		await expect(
			profileMissionProjectService.move("invalid-mission-id", 2),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(
			profileMissionProjectService.move(mission.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		return await expectMoveNoOp({
			createEntity: async () => {
				const mission = await profileMissionProjectService.create(project.id, {
					content: "Mission 1",
					order: 1,
				});
				return { id: mission.id, order: mission.order };
			},
			moveEntity: (id, order) => profileMissionProjectService.move(id, order),
		});
	});

	it("throws if order is more than the number of missions", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(
			profileMissionProjectService.move(mission.id, 99),
		).rejects.toThrow();
	});
});

describe("ProfileMissionProjectService.delete", () => {
	// TEST 1 : suppression d'une mission
	it("deletes a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		await profileMissionProjectService.delete(mission.id);
		const missions =
			await profileMissionProjectService.findAllByProfileProjectId(project.id);
		expect(missions).toHaveLength(0);
	});

	it("throws if mission does not exist", async () => {
		await expect(
			profileMissionProjectService.delete("invalid-mission-id"),
		).rejects.toThrow(NotFoundError);
	});

	it("reorders remaining missions after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission1 = await profileMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		const mission2 = await profileMissionProjectService.create(project.id, {
			content: "Mission 2",
			order: 2,
		});
		await profileMissionProjectService.delete(mission1.id);
		const missions =
			await profileMissionProjectService.findAllByProfileProjectId(project.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});
