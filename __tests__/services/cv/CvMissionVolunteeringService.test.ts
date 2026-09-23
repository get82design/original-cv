import { describe, expect, it } from "vitest";
import { createTestTemplate } from "../../utils/create-test-template";
import { cvVolunteeringService } from "../../../src/services/cv/cvVolunteeringService";
import { createTestUser } from "../../utils/create-test-user";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { cvMissionVolunteeringService } from "../../../src/services/cv/cvMissionsVolunteeringService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvMissionVolunteeringService.create", () => {
	// TEST 1 : création d'une mission
	it("creates a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission = await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Développement API REST",
			order: 1,
		});

		expect(mission.cvVolunteeringId).toBe(volunteering.id);
		expect(mission.content).toBe("Développement API REST");
		expect(mission.order).toBe(1);
	});

	it("throws if volunteering does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await createCV(user.id, template.id);

		await expect(
			cvMissionVolunteeringService.create("invalid-volunteering-id", {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order already exists for volunteering", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Développement API REST",
			order: 1,
		});

		await expect(
			cvMissionVolunteeringService.create(volunteering.id, {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvMissionVolunteeringService.findAllByCvVolunteeringId", () => {
	// TEST 1 : recherche par CV
	it("returns missions volunteering of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});

		const missions = await cvMissionVolunteeringService.findAllByCvVolunteeringId(volunteering.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 1");
		expect(missions[0]?.order).toBe(1);
	});

	it("returns empty array if no mission volunteering exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const missions = await cvMissionVolunteeringService.findAllByCvVolunteeringId(volunteering.id);
		expect(missions).toHaveLength(0);
	});

	it("does not return missions volunteering from another volunteering", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteeringA = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const volunteeringB = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvMissionVolunteeringService.create(volunteeringA.id, {
			content: "Mission 1",
			order: 1,
		});
		await cvMissionVolunteeringService.create(volunteeringB.id, {
			content: "Mission 2",
			order: 1,
		});
		const missions = await cvMissionVolunteeringService.findAllByCvVolunteeringId(volunteeringB.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});

describe("CvMissionVolunteeringService.update", () => {
	// TEST 1 : mise à jour d'une mission
	it("updates a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await cvMissionVolunteeringService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.content).toBe("Mission 2");
	});

	it("throws if mission does not exist", async () => {
		await expect(
			cvMissionVolunteeringService.update("invalid-mission-id", {
				content: "Mission 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("keeps order unchanged when updating content", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await cvMissionVolunteeringService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.order).toBe(1);
	});
});

describe("CvMissionVolunteeringService.move", () => {
	// TEST 1 : déplacement d'une mission
	it("moves a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission1 = await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});

		await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 2",
			order: 2,
		});

		await cvMissionVolunteeringService.move(mission1.id, 2);

		const result = await cvMissionVolunteeringService.findAllByCvVolunteeringId(volunteering.id);

		expect(result[0]!.content).toBe("Mission 2");
		expect(result[1]!.content).toBe("Mission 1");
	});

	it("throws if missions volunteering does not exist", async () => {
		await expect(cvMissionVolunteeringService.move("invalid-mission-id", 2)).rejects.toThrow(
			NotFoundError,
		);
	});

	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(cvMissionVolunteeringService.move(mission.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expectMoveNoOp({
			createEntity: async () => {
				const mission = await cvMissionVolunteeringService.create(volunteering.id, {
					content: "Mission 1",
					order: 1,
				});
				return { id: mission.id, order: mission.order };
			},
			moveEntity: (id, order) => cvMissionVolunteeringService.move(id, order),
		});
	});

	it("throws if order is more than the number of missions", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(cvMissionVolunteeringService.move(mission.id, 99)).rejects.toThrow();
	});
});

describe("CvMissionVolunteeringService.delete", () => {
	// TEST 1 : suppression d'une mission
	it("deletes a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await cvMissionVolunteeringService.delete(mission.id);
		const missions = await cvMissionVolunteeringService.findAllByCvVolunteeringId(volunteering.id);
		expect(missions).toHaveLength(0);
	});

	it("throws if mission does not exist", async () => {
		await expect(cvMissionVolunteeringService.delete("invalid-mission-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("reorders remaining missions after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission1 = await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 1",
			order: 1,
		});
		await cvMissionVolunteeringService.create(volunteering.id, {
			content: "Mission 2",
			order: 2,
		});
		await cvMissionVolunteeringService.delete(mission1.id);
		const missions = await cvMissionVolunteeringService.findAllByCvVolunteeringId(volunteering.id);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});
