import { describe, expect, it } from "vitest";
import { cvSkillGroupService } from "../../../src/services/cv/cvSkillGroupService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { skillService } from "../../../src/services/commons/skillService";
import { cvSkillService } from "../../../src/services/cv/cvSkillService";
import { Level } from "../../../generated/prisma/client";
import { prismaTest } from "../../../lib/prismaTest";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvSkillGroupService.create", () => {
	it("creates a skill group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		expect(skillGroup.title).toBe("Skill Group 1");
		expect(skillGroup.order).toBe(1);
	});

	it("throws if CV does not exist", async () => {
		await expect(
			cvSkillGroupService.create("unknown-cv", {
				title: "Skill Group 1",
				order: 1,
				skills: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await expect(
			cvSkillGroupService.create(cv.id, {
				title: "Skill Group 1",
				order: 1,
				skills: [],
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await expect(
			cvSkillGroupService.create(cv.id, {
				title: "Skill Group 2",
				order: 1,
				skills: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvSkillGroupService.findAllByCvId", () => {
	it("finds all skill groups by CV ID", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skillGroup2 = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		const skillGroups = await cvSkillGroupService.findAllByCvId(cv.id);
		expect(skillGroups.length).toBe(2);
		expect(skillGroups[0]?.title).toBe("Skill Group 1");
		expect(skillGroups[0]?.order).toBe(1);
		expect(skillGroups[1]?.title).toBe("Skill Group 2");
		expect(skillGroups[1]?.order).toBe(2);
	});

	it("returns empty array if no skill groups exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroups = await cvSkillGroupService.findAllByCvId(cv.id);
		expect(skillGroups).toEqual([]);
	});

	it("return only skill groups for the given CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const cv2 = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await cvSkillGroupService.create(cv2.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		const skillGroups = await cvSkillGroupService.findAllByCvId(cv.id);
		expect(skillGroups.length).toBe(1);
		expect(skillGroups[0]?.title).toBe("Skill Group 1");
		expect(skillGroups[0]?.order).toBe(1);
	});
});

describe("CvSkillGroupService.update", () => {
	it("updates a skill group by ID", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const updatedSkillGroup = await cvSkillGroupService.update(skillGroup.id, {
			title: "Skill Group 2",
			skills: [],
		});
		expect(updatedSkillGroup.title).toBe("Skill Group 2");
		expect(updatedSkillGroup.order).toBe(1);
	});

	it("throws if skill group does not exist", async () => {
		await expect(
			cvSkillGroupService.update("unknown-skill-group", {
				title: "Skill Group 2",
				skills: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		await expect(
			cvSkillGroupService.update(skillGroup.id, {
				title: "Skill Group 2",
				skills: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvSkillGroupService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a skill group to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup1 = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skillGroup2 = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		await cvSkillGroupService.move(skillGroup2.id, 1);
		const result = await cvSkillGroupService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(skillGroup2.id);
		expect(result[1]!.id).toBe(skillGroup1.id);
	});

	// TEST 2 : skill group inexistant
	it("throws if skill group does not exist", async () => {
		await expect(cvSkillGroupService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await expect(cvSkillGroupService.move(skillGroup.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		return await expectMoveNoOp({
			createEntity: async () => {
				const skillGroup = await cvSkillGroupService.create(cv.id, {
					title: "Skill Group 1",
					order: 1,
					skills: [],
				});
				return { id: skillGroup.id, order: skillGroup.order };
			},
			moveEntity: (id, order) => cvSkillGroupService.move(id, order),
		});
	});
});

describe("CvSkillGroupService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a skill group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await cvSkillGroupService.delete(skillGroup.id);
		const result = await cvSkillGroupService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : skill group inexistant
	it("throws if skill group does not exist", async () => {
		await expect(cvSkillGroupService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des skill groups après suppression
	it("reorders remaining skill groups after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skillGroup2 = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		await cvSkillGroupService.delete(skillGroup.id);
		const result = await cvSkillGroupService.findAllByCvId(cv.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.title).toBe("Skill Group 2");
	});

	it("deletes related cvSkills when deleting group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({ name: "Skill 1" });
		await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			level: Level.Débutant,
			order: 1,
		});
		await cvSkillGroupService.delete(skillGroup.id);
		// CvSkill supprimés
		const cvSkills = await prismaTest.cvSkill.findMany({
			where: { groupId: skillGroup.id },
		});
		expect(cvSkills).toHaveLength(0);
		// Skill catalogue conservé
		const skills = await skillService.findAll();
		expect(skills).toHaveLength(1);
		expect(skills[0]!.id).toBe(skill.id);
	});
});
