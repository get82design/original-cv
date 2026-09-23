import { describe, expect, it } from "vitest";
import { cvCompetenceGroupService } from "../../../src/services/cv/cvCompetenceGroupService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvCompetenceService } from "../../../src/services/cv/cvCompetenceService";
import { prismaTest } from "../../../lib/prismaTest";
import { competenceService } from "../../../src/services/commons/competenceService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvCompetenceGroupService.create", () => {
	it("creates a competence group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		expect(competenceGroup.title).toBe("Competence Group 1");
		expect(competenceGroup.order).toBe(1);
	});

	it("throws if CV does not exist", async () => {
		await expect(
			cvCompetenceGroupService.create("unknown-cv", {
				title: "Competence Group 1",
				order: 1,
				competences: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await expect(
			cvCompetenceGroupService.create(cv.id, {
				title: "Competence Group 1",
				order: 2,
				competences: [],
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await expect(
			cvCompetenceGroupService.create(cv.id, {
				title: "Competence Group 2",
				order: 1,
				competences: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvCompetenceGroupService.findAllByCvId", () => {
	it("finds all competence groups by CV ID", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 2",
			order: 2,
			competences: [],
		});
		const competenceGroups = await cvCompetenceGroupService.findAllByCvId(cv.id);
		expect(competenceGroups.length).toBe(2);
		expect(competenceGroups[0]?.title).toBe("Competence Group 1");
		expect(competenceGroups[0]?.order).toBe(1);
		expect(competenceGroups[1]?.title).toBe("Competence Group 2");
		expect(competenceGroups[1]?.order).toBe(2);
	});

	it("returns empty array if no competence groups exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroups = await cvCompetenceGroupService.findAllByCvId(cv.id);
		expect(competenceGroups).toEqual([]);
	});

	it("return only competence groups for the given CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const cv2 = await createCV(user.id, template.id);
		await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await cvCompetenceGroupService.create(cv2.id, {
			title: "Competence Group 2",
			order: 2,
			competences: [],
		});
		const competenceGroups = await cvCompetenceGroupService.findAllByCvId(cv.id);
		expect(competenceGroups.length).toBe(1);
		expect(competenceGroups[0]?.title).toBe("Competence Group 1");
		expect(competenceGroups[0]?.order).toBe(1);
	});
});

describe("CvCompetenceGroupService.update", () => {
	it("updates a competence group by ID", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const updatedCompetenceGroup = await cvCompetenceGroupService.update(competenceGroup.id, {
			title: "Competence Group 2",
			competences: [],
		});
		expect(updatedCompetenceGroup.title).toBe("Competence Group 2");
		expect(updatedCompetenceGroup.order).toBe(1);
	});

	it("throws if competence group does not exist", async () => {
		await expect(
			cvCompetenceGroupService.update("unknown-competence-group", {
				title: "Competence Group 2",
				competences: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 2",
			order: 2,
			competences: [],
		});
		await expect(
			cvCompetenceGroupService.update(competenceGroup.id, {
				title: "Competence Group 2",
				competences: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvCompetenceGroupService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a competence group to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup1 = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competenceGroup2 = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 2",
			order: 2,
			competences: [],
		});
		await cvCompetenceGroupService.move(competenceGroup2.id, 1);
		const result = await cvCompetenceGroupService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(competenceGroup2.id);
		expect(result[1]!.id).toBe(competenceGroup1.id);
	});

	// TEST 2 : competence group inexistant
	it("throws if competence group does not exist", async () => {
		await expect(cvCompetenceGroupService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await expect(cvCompetenceGroupService.move(competenceGroup.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
					title: "Competence Group 1",
					order: 1,
					competences: [],
				});
				return { id: competenceGroup.id, order: competenceGroup.order };
			},
			moveEntity: (id, order) => cvCompetenceGroupService.move(id, order),
		});
	});
});

describe("CvCompetenceGroupService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a competence group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await cvCompetenceGroupService.delete(competenceGroup.id);
		const result = await cvCompetenceGroupService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : competence group inexistant
	it("throws if competence group does not exist", async () => {
		await expect(cvCompetenceGroupService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des competence groups après suppression
	it("reorders remaining competence groups after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 2",
			order: 2,
			competences: [],
		});
		await cvCompetenceGroupService.delete(competenceGroup.id);
		const result = await cvCompetenceGroupService.findAllByCvId(cv.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.title).toBe("Competence Group 2");
	});

	it("deletes related cvCompetences when deleting group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({ name: "Competence 1" });
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await cvCompetenceGroupService.delete(competenceGroup.id);
		// CvSkill supprimés
		const cvCompetences = await prismaTest.cvCompetence.findMany({
			where: { groupId: competenceGroup.id },
		});
		expect(cvCompetences).toHaveLength(0);
		// Skill catalogue conservé
		const competences = await competenceService.findAll();
		expect(competences).toHaveLength(1);
		expect(competences[0]!.id).toBe(competence.id);
	});
});
