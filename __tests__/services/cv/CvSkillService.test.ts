import { describe, expect, it } from "vitest";
import { cvSkillGroupService } from "../../../src/services/cv/cvSkillGroupService";
import { cvSkillService } from "../../../src/services/cv/cvSkillService";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { skillService } from "../../../src/services/cv/skillService";
import { createTestTemplate } from "../../utils/create-test-template";
import { createTestUser } from "../../utils/create-test-user";
import { Level } from "../../../generated/prisma/enums";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvSkillService.create", () => {
	it("creates a skill", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});

		const skill = await skillService.create({
			name: "Skill 1",
		});

		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		expect(cvSkill.id).toBeDefined();
		expect(cvSkill.skillId).toBe(skill.id);
		expect(cvSkill.order).toBe(1);
		expect(cvSkill.level).toBe(Level.Débutant);
	});

	it("throws if group does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(
			cvSkillService.create("unknown-group", {
				skillId: "unknown-skill",
				order: 1,
				level: Level.Débutant,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if skill does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await expect(
			cvSkillService.create(skillGroup.id, {
				skillId: "unknown-skill",
				order: 1,
				level: Level.Débutant,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if skill is already in group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			cvSkillService.create(skillGroup.id, {
				skillId: skill.id,
				order: 2,
				level: Level.Débutant,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			cvSkillService.create(skillGroup.id, {
				skillId: skill.id,
				order: 1,
				level: Level.Débutant,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("creates another skill in same group with different order", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		await cvSkillService.create(skillGroup.id, {
			skillId: skill2.id,
			order: 2,
			level: Level.Débutant,
		});
		const result = await cvSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(2);
		expect(result[0]!.skillId).toBe(skill.id);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.level).toBe(Level.Débutant);
		expect(result[1]!.skillId).toBe(skill2.id);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.level).toBe(Level.Débutant);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			cvSkillService.create(skillGroup.id, {
				skillId: skill.id,
				order: 1,
				level: Level.Débutant,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvSkillService.findAllByGroupId", () => {
	it("returns skills of a group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const result = await cvSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.skillId).toBe(skill.id);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.level).toBe(Level.Débutant);
	});

	it("returns empty array if no skill exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const result = await cvSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(0);
	});

	it("does not return skills from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const cv2 = await createCV(user.id, template.id);
		const skillGroup2 = await cvSkillGroupService.create(cv2.id, {
			title: "Skill Group 2",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await cvSkillService.create(skillGroup2.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const result = await cvSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(0);
	});
});

describe("CvSkillService.update", () => {
	it("updates a skill", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const result = await cvSkillService.update(cvSkill.id, {
			skillId: skill.id,
			level: Level.Intermédiaire,
		});
		expect(result.id).toBe(cvSkill.id);
		expect(result.skillId).toBe(skill.id);
		expect(result.order).toBe(1);
		expect(result.level).toBe(Level.Intermédiaire);
	});

	it("updates referenced skill", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		const result = await cvSkillService.update(cvSkill.id, {
			skillId: skill2.id,
			level: Level.Intermédiaire,
		});
		expect(result.id).toBe(cvSkill.id);
		expect(result.skillId).toBe(skill2.id);
		expect(result.order).toBe(1);
		expect(result.level).toBe(Level.Intermédiaire);
	});

	it("throws if skill does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			cvSkillService.update(cvSkill.id, {
				skillId: "unknown-skill",
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if referenced skill does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			cvSkillService.update(cvSkill.id, {
				skillId: "unknown-skill",
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new skill already exists in group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		await cvSkillService.create(skillGroup.id, {
			skillId: skill2.id,
			order: 2,
			level: Level.Débutant,
		});
		await expect(
			cvSkillService.update(cvSkill.id, {
				skillId: skill2.id,
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvSkillService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a skill to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup1 = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup1.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		const cvSkill2 = await cvSkillService.create(skillGroup1.id, {
			skillId: skill2.id,
			order: 2,
			level: Level.Débutant,
		});
		await cvSkillService.move(cvSkill.id, 2);
		const result = await cvSkillService.findAllByGroupId(skillGroup1.id);
		expect(result).toHaveLength(2);
		expect(result[0]!.skillId).toBe(skill2.id);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.level).toBe(Level.Débutant);
		expect(result[1]!.skillId).toBe(skill.id);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.level).toBe(Level.Débutant);
	});

	// TEST 2 : cvskill inexistant
	it("throws if cvskill does not exist", async () => {
		await expect(cvSkillService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
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
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(cvSkillService.move(cvSkill.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		return await expectMoveNoOp({
			createEntity: async () => {
				return { id: cvSkill.id, order: cvSkill.order };
			},
			moveEntity: (id, order) => cvSkillService.move(id, order),
		});
	});
});

describe("CvSkillService.delete", () => {
	it("deletes a skill", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await cvSkillService.delete(cvSkill.id);
		const result = await cvSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(0);
	});

	it("throws if skill does not exist", async () => {
		await expect(cvSkillService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("reorders remaining skills", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const skillGroup = await cvSkillGroupService.create(cv.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const cvSkill = await cvSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		const cvSkill2 = await cvSkillService.create(skillGroup.id, {
			skillId: skill2.id,
			order: 2,
			level: Level.Débutant,
		});
		await cvSkillService.delete(cvSkill.id);
		const result = await cvSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.skillId).toBe(skill2.id);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.level).toBe(Level.Débutant);
	});
});
