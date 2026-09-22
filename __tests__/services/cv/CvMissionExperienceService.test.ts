import { describe, expect, it } from "vitest";
import { createTestTemplate } from "../../utils/create-test-template";
import { cvExperienceService } from "../../../src/services/cv/cvExperienceService";
import { createTestUser } from "../../utils/create-test-user";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvMissionExperienceService } from "../../../src/services/cv/cvMissionExperienceService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvMissionExperienceService.create", () => {
	// TEST 1 : création d'une mission
	it("creates a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission = await cvMissionExperienceService.create(experience.id, {
			content: "Développement API REST",
			order: 1,
		});

		expect(mission.cvExperienceId).toBe(experience.id);
		expect(mission.content).toBe("Développement API REST");
		expect(mission.order).toBe(1);
	});

	it("throws if volunteering does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			cvMissionExperienceService.create("invalid-experience-id", {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order already exists for experience", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await cvMissionExperienceService.create(experience.id, {
			content: "Développement API REST",
			order: 1,
		});

		await expect(
			cvMissionExperienceService.create(experience.id, {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvMissionExperienceService.findAllByCvExperienceId", () => {
	// TEST 1 : recherche par CV
	it("returns missions experience of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});

		const missions = await cvMissionExperienceService.findAllByCvExperienceId(experience.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 1");
		expect(missions[0]?.order).toBe(1);
	});

	it("returns empty array if no mission experience exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const missions = await cvMissionExperienceService.findAllByCvExperienceId(experience.id);
		expect(missions).toHaveLength(0);
	});

	it("does not return missions experience from another experience", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experienceA = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const experienceB = await cvExperienceService.create(cv.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvMissionExperienceService.create(experienceA.id, {
			content: "Mission 1",
			order: 1,
		});
		await cvMissionExperienceService.create(experienceB.id, {
			content: "Mission 2",
			order: 1,
		});
		const missions = await cvMissionExperienceService.findAllByCvExperienceId(experienceB.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});

describe("CvMissionExperienceService.update", () => {
	// TEST 1 : mise à jour d'une mission
	it("updates a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await cvMissionExperienceService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.content).toBe("Mission 2");
	});

	it("throws if mission does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(
			cvMissionExperienceService.update("invalid-mission-id", {
				content: "Mission 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("keeps order unchanged when updating content", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await cvMissionExperienceService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.order).toBe(1);
	});
});

describe("CvMissionExperienceService.move", () => {
	// TEST 1 : déplacement d'une mission
	it("moves a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission1 = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});

		const mission2 = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 2",
			order: 2,
		});

		await cvMissionExperienceService.move(mission1.id, 2);

		const result = await cvMissionExperienceService.findAllByCvExperienceId(experience.id);

		expect(result[0]!.content).toBe("Mission 2");
		expect(result[1]!.content).toBe("Mission 1");
	});

	it("throws if missions experience does not exist", async () => {
		await expect(cvMissionExperienceService.move("invalid-mission-id", 2)).rejects.toThrow(
			NotFoundError,
		);
	});

	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(cvMissionExperienceService.move(mission.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expectMoveNoOp({
			createEntity: async () => {
				const mission = await cvMissionExperienceService.create(experience.id, {
					content: "Mission 1",
					order: 1,
				});
				return { id: mission.id, order: mission.order };
			},
			moveEntity: (id, order) => cvMissionExperienceService.move(id, order),
		});
	});

	it("throws if order is more than the number of missions", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(cvMissionExperienceService.move(mission.id, 99)).rejects.toThrow();
	});
});

describe("CvMissionExperienceService.delete", () => {
	// TEST 1 : suppression d'une mission
	it("deletes a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		await cvMissionExperienceService.delete(mission.id);
		const missions = await cvMissionExperienceService.findAllByCvExperienceId(experience.id);
		expect(missions).toHaveLength(0);
	});

	it("throws if mission does not exist", async () => {
		await expect(cvMissionExperienceService.delete("invalid-mission-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("reorders remaining missions after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission1 = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 1",
			order: 1,
		});
		const mission2 = await cvMissionExperienceService.create(experience.id, {
			content: "Mission 2",
			order: 2,
		});
		await cvMissionExperienceService.delete(mission1.id);
		const missions = await cvMissionExperienceService.findAllByCvExperienceId(experience.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});
