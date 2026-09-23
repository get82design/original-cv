import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileExperienceService } from "../../../src/services/profile/profileExperienceService";
import { profileMissionExperienceService } from "../../../src/services/profile/profileMissionExperienceService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileMissionExperienceService.create", () => {
	// TEST 1 : création d'une mission
	it("creates a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission = await profileMissionExperienceService.create(experience.id, {
			content: "Développement API REST",
			order: 1,
		});

		expect(mission.experienceId).toBe(experience.id);
		expect(mission.content).toBe("Développement API REST");
		expect(mission.order).toBe(1);
	});

	it("throws if volunteering does not exist", async () => {
		await expect(
			profileMissionExperienceService.create("invalid-experience-id", {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order already exists for experience", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			description: "Description 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileMissionExperienceService.create(experience.id, {
			content: "Développement API REST",
			order: 1,
		});

		await expect(
			profileMissionExperienceService.create(experience.id, {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileMissionExperienceService.findAllByExperienceId", () => {
	// TEST 1 : recherche par profile
	it("returns missions experience of a profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});

		const missions = await profileMissionExperienceService.findAllByExperienceId(experience.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 1");
		expect(missions[0]?.order).toBe(1);
	});

	it("returns empty array if no mission experience exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const missions = await profileMissionExperienceService.findAllByExperienceId(experience.id);
		expect(missions).toHaveLength(0);
	});

	it("does not return missions experience from another experience", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experienceA = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const experienceB = await profileExperienceService.create(profile.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileMissionExperienceService.create(experienceA.id, {
			content: "Mission 1",
			order: 1,
		});
		await profileMissionExperienceService.create(experienceB.id, {
			content: "Mission 2",
			order: 1,
		});
		const missions = await profileMissionExperienceService.findAllByExperienceId(experienceB.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});

describe("ProfileMissionExperienceService.update", () => {
	// TEST 1 : mise à jour d'une mission
	it("updates a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await profileMissionExperienceService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.content).toBe("Mission 2");
	});

	it("throws if mission does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(
			profileMissionExperienceService.update("invalid-mission-id", {
				content: "Mission 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("keeps order unchanged when updating content", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await profileMissionExperienceService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.order).toBe(1);
	});
});

describe("ProfileMissionExperienceService.move", () => {
	// TEST 1 : déplacement d'une mission
	it("moves a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission1 = await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});

		await profileMissionExperienceService.create(experience.id, {
			content: "Mission 2",
			order: 2,
		});

		await profileMissionExperienceService.move(mission1.id, 2);

		const result = await profileMissionExperienceService.findAllByExperienceId(experience.id);

		expect(result[0]!.content).toBe("Mission 2");
		expect(result[1]!.content).toBe("Mission 1");
	});

	it("throws if missions experience does not exist", async () => {
		await expect(profileMissionExperienceService.move("invalid-mission-id", 2)).rejects.toThrow(
			NotFoundError,
		);
	});

	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(profileMissionExperienceService.move(mission.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		return await expectMoveNoOp({
			createEntity: async () => {
				const mission = await profileMissionExperienceService.create(experience.id, {
					content: "Mission 1",
					order: 1,
				});
				return { id: mission.id, order: mission.order };
			},
			moveEntity: (id, order) => profileMissionExperienceService.move(id, order),
		});
	});

	it("throws if order is more than the number of missions", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(profileMissionExperienceService.move(mission.id, 99)).rejects.toThrow();
	});
});

describe("ProfileMissionExperienceService.delete", () => {
	// TEST 1 : suppression d'une mission
	it("deletes a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await profileMissionExperienceService.delete(mission.id);
		const missions = await profileMissionExperienceService.findAllByExperienceId(experience.id);
		expect(missions).toHaveLength(0);
	});

	it("throws if mission does not exist", async () => {
		await expect(profileMissionExperienceService.delete("invalid-mission-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("reorders remaining missions after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission1 = await profileMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await profileMissionExperienceService.create(experience.id, {
			content: "Mission 2",
			order: 2,
		});
		await profileMissionExperienceService.delete(mission1.id);
		const missions = await profileMissionExperienceService.findAllByExperienceId(experience.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});
