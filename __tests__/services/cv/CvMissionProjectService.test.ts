import { describe, expect, it } from "vitest";
import { createTestTemplate } from "../../utils/create-test-template";
import { cvProjectService } from "../../../src/services/cv/cvProjectService";
import { createTestUser } from "../../utils/create-test-user";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { cvMissionProjectService } from "../../../src/services/cv/cvMissionProjectService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvMissionProjectService.create", () => {
	// TEST 1 : création d'une mission
	it("creates a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission = await cvMissionProjectService.create(project.id, {
			content: "Développement API REST",
			order: 1,
		});

		expect(mission.cvProjectId).toBe(project.id);
		expect(mission.content).toBe("Développement API REST");
		expect(mission.order).toBe(1);
	});

	it("throws if project does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			cvMissionProjectService.create("invalid-project-id", {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order already exists for project", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await cvMissionProjectService.create(project.id, {
			content: "Développement API REST",
			order: 1,
		});

		await expect(
			cvMissionProjectService.create(project.id, {
				content: "Développement API REST",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvMissionProjectService.findAllByCvProjectId", () => {
	// TEST 1 : recherche par CV
	it("returns missions project of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});

		const missions = await cvMissionProjectService.findAllByCvProjectId(
			project.id,
		);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 1");
		expect(missions[0]?.order).toBe(1);
	});

	it("returns empty array if no mission project exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const missions = await cvMissionProjectService.findAllByCvProjectId(
			project.id,
		);
		expect(missions).toHaveLength(0);
	});

	it("does not return missions project from another project", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const projectA = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const projectB = await cvProjectService.create(cv.id, {
			title: "Projet 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvMissionProjectService.create(projectA.id, {
			content: "Mission 1",
			order: 1,
		});
		await cvMissionProjectService.create(projectB.id, {
			content: "Mission 2",
			order: 1,
		});
		const missions = await cvMissionProjectService.findAllByCvProjectId(
			projectB.id,
		);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});

describe("CvMissionProjectService.update", () => {
	// TEST 1 : mise à jour d'une mission
	it("updates a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await cvMissionProjectService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.content).toBe("Mission 2");
	});

	it("throws if mission does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(
			cvMissionProjectService.update("invalid-mission-id", {
				content: "Mission 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("keeps order unchanged when updating content", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		const updatedMission = await cvMissionProjectService.update(mission.id, {
			content: "Mission 2",
		});
		expect(updatedMission.order).toBe(1);
	});
});

describe("CvMissionProjectService.move", () => {
	// TEST 1 : déplacement d'une mission
	it("moves a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		const mission1 = await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});

		const mission2 = await cvMissionProjectService.create(project.id, {
			content: "Mission 2",
			order: 2,
		});

		await cvMissionProjectService.move(mission1.id, 2);

		const result = await cvMissionProjectService.findAllByCvProjectId(
			project.id,
		);

		expect(result[0]!.content).toBe("Mission 2");
		expect(result[1]!.content).toBe("Mission 1");
	});

	it("throws if missions project does not exist", async () => {
		await expect(
			cvMissionProjectService.move("invalid-mission-id", 2),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(cvMissionProjectService.move(mission.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expectMoveNoOp({
			createEntity: async () => {
				const mission = await cvMissionProjectService.create(project.id, {
					content: "Mission 1",
					order: 1,
				});
				return { id: mission.id, order: mission.order };
			},
			moveEntity: (id, order) => cvMissionProjectService.move(id, order),
		});
	});

	it("throws if order is more than the number of missions", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		await expect(
			cvMissionProjectService.move(mission.id, 99),
		).rejects.toThrow();
	});
});

describe("CvMissionProjectService.delete", () => {
	// TEST 1 : suppression d'une mission
	it("deletes a mission", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission = await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		await cvMissionProjectService.delete(mission.id);
		const missions = await cvMissionProjectService.findAllByCvProjectId(
			project.id,
		);
		expect(missions).toHaveLength(0);
	});

	it("throws if mission does not exist", async () => {
		await expect(
			cvMissionProjectService.delete("invalid-mission-id"),
		).rejects.toThrow(NotFoundError);
	});

	it("reorders remaining missions after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Projet 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const mission1 = await cvMissionProjectService.create(project.id, {
			content: "Mission 1",
			order: 1,
		});
		const mission2 = await cvMissionProjectService.create(project.id, {
			content: "Mission 2",
			order: 2,
		});
		await cvMissionProjectService.delete(mission1.id);
		const missions = await cvMissionProjectService.findAllByCvProjectId(
			project.id,
		);
		expect(missions).toHaveLength(1);
		expect(missions[0]?.content).toBe("Mission 2");
		expect(missions[0]?.order).toBe(1);
	});
});
