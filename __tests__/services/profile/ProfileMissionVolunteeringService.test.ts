import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileVolunteeringService } from "../../../src/services/profile/profileVolunteeringService";
import { profileMissionVolunteeringService } from "../../../src/services/profile/profileMissionVolunteeringService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileMissionVolunteeringService.create", () => {
	// TEST 1 : création d'une mission
	it("creates a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission = await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Développement API REST",
			order: 1,
		});

		expect(mission.volunteeringId).toBe(volunteering.id);
		expect(mission.content).toBe("Développement API REST");
		expect(mission.order).toBe(1);
	});

	it("throws if volunteering does not exist", async () => {
		await expect(
			profileMissionVolunteeringService.create("invalid-volunteering-id", {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order already exists for volunteering", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Développement API REST",
			order: 1,
		});

		await expect(
			profileMissionVolunteeringService.create(volunteering.id, {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileMissionVolunteeringService.findAllByProfileVolunteeringId", () => {
	// TEST 1 : recherche par Profile
	it("returns missions volunteering of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});

		const missions = await profileMissionVolunteeringService.findAllByProfileVolunteeringId(
			volunteering.id,
		);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 1");
		expect(missions[0]?.order).toBe(1);
	});

	it("returns empty array if no mission volunteering exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const missions = await profileMissionVolunteeringService.findAllByProfileVolunteeringId(
			volunteering.id,
		);
		expect(missions).toHaveLength(0);
	});

	it("does not return missions volunteering from another volunteering", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "John", "Doe");
		const volunteeringA = await profileVolunteeringService.create(profileA.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const volunteeringB = await profileVolunteeringService.create(profileB.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileMissionVolunteeringService.create(volunteeringA.id, {
			content: "Mission 1",
			order: 1,
		});
		await profileMissionVolunteeringService.create(volunteeringB.id, {
			content: "Mission 2",
			order: 1,
		});
		const missions = await profileMissionVolunteeringService.findAllByProfileVolunteeringId(
			volunteeringB.id,
		);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});

describe("ProfileMissionVolunteeringService.update", () => {
	// TEST 1 : mise à jour d'une mission
	it("updates a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await profileMissionVolunteeringService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.content).toBe("Mission 2");
	});

	it("throws if mission does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(
			profileMissionVolunteeringService.update("invalid-mission-id", {
				content: "Mission 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("keeps order unchanged when updating content", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await profileMissionVolunteeringService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.order).toBe(1);
	});
});

describe("ProfileMissionVolunteeringService.move", () => {
	// TEST 1 : déplacement d'une mission
	it("moves a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission1 = await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});

		await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 2",
			order: 2,
		});

		await profileMissionVolunteeringService.move(mission1.id, 2);

		const result = await profileMissionVolunteeringService.findAllByProfileVolunteeringId(
			volunteering.id,
		);

		expect(result[0]!.content).toBe("Mission 2");
		expect(result[1]!.content).toBe("Mission 1");
	});

	it("throws if missions volunteering does not exist", async () => {
		await expect(profileMissionVolunteeringService.move("invalid-mission-id", 2)).rejects.toThrow(
			NotFoundError,
		);
	});

	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(profileMissionVolunteeringService.move(mission.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		return await expectMoveNoOp({
			createEntity: async () => {
				const mission = await profileMissionVolunteeringService.create(volunteering.id, {
					content: "Mission 1",
					order: 1,
				});
				return { id: mission.id, order: mission.order };
			},
			moveEntity: (id, order) => profileMissionVolunteeringService.move(id, order),
		});
	});

	it("throws if order is more than the number of missions", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(profileMissionVolunteeringService.move(mission.id, 99)).rejects.toThrow();
	});
});

describe("ProfileMissionVolunteeringService.delete", () => {
	// TEST 1 : suppression d'une mission
	it("deletes a mission", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await profileMissionVolunteeringService.delete(mission.id);
		const missions = await profileMissionVolunteeringService.findAllByProfileVolunteeringId(
			volunteering.id,
		);
		expect(missions).toHaveLength(0);
	});

	it("throws if mission does not exist", async () => {
		await expect(profileMissionVolunteeringService.delete("invalid-mission-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("reorders remaining missions after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission1 = await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await profileMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 2",
			order: 2,
		});
		await profileMissionVolunteeringService.delete(mission1.id);
		const missions = await profileMissionVolunteeringService.findAllByProfileVolunteeringId(
			volunteering.id,
		);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});
