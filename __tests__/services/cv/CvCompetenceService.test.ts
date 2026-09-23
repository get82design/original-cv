import { describe, expect, it } from "vitest";
import { cvCompetenceGroupService } from "../../../src/services/cv/cvCompetenceGroupService";
import { cvCompetenceService } from "../../../src/services/cv/cvCompetenceService";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { competenceService } from "../../../src/services/commons/competenceService";
import { createTestTemplate } from "../../utils/create-test-template";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvCompetenceService.create", () => {
	it("creates a competence", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});

		const competence = await competenceService.create({
			name: "Competence 1",
		});

		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		expect(cvCompetence.id).toBeDefined();
		expect(cvCompetence.competenceId).toBe(competence.id);
		expect(cvCompetence.order).toBe(1);
	});

	it("throws if group does not exist", async () => {
		await expect(
			cvCompetenceService.create("unknown-group", {
				competenceId: "unknown-competence",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if competence does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await expect(
			cvCompetenceService.create(competenceGroup.id, {
				competenceId: "unknown-competence",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if competence is already in group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(
			cvCompetenceService.create(competenceGroup.id, {
				competenceId: competence.id,
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(
			cvCompetenceService.create(competenceGroup.id, {
				competenceId: competence.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("creates another competence in same group with different order", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence2.id,
			order: 2,
		});
		const result = await cvCompetenceService.findAllByGroupId(competenceGroup.id);
		expect(result).toHaveLength(2);
		expect(result[0]!.competenceId).toBe(competence.id);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.competenceId).toBe(competence2.id);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(
			cvCompetenceService.create(competenceGroup.id, {
				competenceId: competence.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvCompetenceService.findAllByGroupId", () => {
	it("returns competences of a group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		const result = await cvCompetenceService.findAllByGroupId(competenceGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.competenceId).toBe(competence.id);
		expect(result[0]!.order).toBe(1);
	});

	it("returns empty array if no competence exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const result = await cvCompetenceService.findAllByGroupId(competenceGroup.id);
		expect(result).toHaveLength(0);
	});

	it("does not return competences from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const cv2 = await createCV(user.id, template.id);
		const competenceGroup2 = await cvCompetenceGroupService.create(cv2.id, {
			title: "Competence Group 2",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await cvCompetenceService.create(competenceGroup2.id, {
			competenceId: competence.id,
			order: 1,
		});
		const result = await cvCompetenceService.findAllByGroupId(competenceGroup.id);
		expect(result).toHaveLength(0);
	});
});

describe("CvCompetenceService.update", () => {
	it("updates a competence", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		const result = await cvCompetenceService.update(cvCompetence.id, {
			competenceId: competence2.id,
		});
		expect(result.id).toBe(cvCompetence.id);
		expect(result.competenceId).toBe(competence2.id);
		expect(result.order).toBe(1);
	});

	it("updates referenced competence", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		const result = await cvCompetenceService.update(cvCompetence.id, {
			competenceId: competence2.id,
		});
		expect(result.id).toBe(cvCompetence.id);
		expect(result.competenceId).toBe(competence2.id);
		expect(result.order).toBe(1);
	});

	it("throws if competence does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(
			cvCompetenceService.update(cvCompetence.id, {
				competenceId: "unknown-competence",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if referenced competence does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(
			cvCompetenceService.update(cvCompetence.id, {
				competenceId: "unknown-competence",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new competence already exists in group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence2.id,
			order: 2,
		});
		await expect(
			cvCompetenceService.update(cvCompetence.id, {
				competenceId: competence2.id,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvCompetenceService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a competence to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup1 = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup1.id, {
			competenceId: competence.id,
			order: 1,
		});
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		await cvCompetenceService.create(competenceGroup1.id, {
			competenceId: competence2.id,
			order: 2,
		});
		await cvCompetenceService.move(cvCompetence.id, 2);
		const result = await cvCompetenceService.findAllByGroupId(competenceGroup1.id);
		expect(result).toHaveLength(2);
		expect(result[0]!.competenceId).toBe(competence2.id);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.competenceId).toBe(competence.id);
		expect(result[1]!.order).toBe(2);
	});

	// TEST 2 : cvcompetence inexistant
	it("throws if cvcompetence does not exist", async () => {
		await expect(cvCompetenceService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(cvCompetenceService.move(cvCompetence.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const newCompetence = await competenceService.create({
			name: "Competence 1",
		});
		await expectMoveNoOp({
			createEntity: async () => {
				const competence = await cvCompetenceService.create(competenceGroup.id, {
					competenceId: newCompetence.id,
					order: 1,
				});
				return { id: competence.id, order: competence.order };
			},
			moveEntity: (id, order) => cvCompetenceService.move(id, order),
		});
	});
});

describe("CvCompetenceService.delete", () => {
	it("deletes a competence", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await cvCompetenceService.delete(cvCompetence.id);
		const result = await cvCompetenceService.findAllByGroupId(competenceGroup.id);
		expect(result).toHaveLength(0);
	});

	it("throws if competence does not exist", async () => {
		await expect(cvCompetenceService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	it("reorders remaining competences", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const competenceGroup = await cvCompetenceGroupService.create(cv.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const cvCompetence = await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		await cvCompetenceService.create(competenceGroup.id, {
			competenceId: competence2.id,
			order: 2,
		});
		await cvCompetenceService.delete(cvCompetence.id);
		const result = await cvCompetenceService.findAllByGroupId(competenceGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.competenceId).toBe(competence2.id);
		expect(result[0]!.order).toBe(1);
	});
});
