import { describe, expect, it } from "vitest";
import { skillService } from "../../../src/services/commons/skillService";
import { createTestUser } from "../../utils/create-test-user";
import { Level } from "../../../generated/prisma/enums";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileSkillGroupService } from "../../../src/services/profile/profileSkillGroupService";
import { profileSkillService } from "../../../src/services/profile/profileSkillService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileSkillService.create", () => {
	it("creates a skill", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});

		const skill = await skillService.create({
			name: "Skill 1",
		});

		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		expect(profileSkill.id).toBeDefined();
		expect(profileSkill.skillId).toBe(skill.id);
		expect(profileSkill.order).toBe(1);
		expect(profileSkill.level).toBe(Level.Débutant);
	});

	it("throws if group does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileSkillService.create("unknown-group", {
				skillId: "unknown-skill",
				order: 1,
				level: Level.Débutant,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if skill does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await expect(
			profileSkillService.create(skillGroup.id, {
				skillId: "unknown-skill",
				order: 1,
				level: Level.Débutant,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if skill is already in group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			profileSkillService.create(skillGroup.id, {
				skillId: skill.id,
				order: 2,
				level: Level.Débutant,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			profileSkillService.create(skillGroup.id, {
				skillId: skill.id,
				order: 1,
				level: Level.Débutant,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("creates another skill in same group with different order", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		await profileSkillService.create(skillGroup.id, {
			skillId: skill2.id,
			order: 2,
			level: Level.Débutant,
		});
		const result = await profileSkillService.findAllByGroupId(skillGroup.id);
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			profileSkillService.create(skillGroup.id, {
				skillId: skill.id,
				order: 1,
				level: Level.Débutant,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileSkillService.findAllByGroupId", () => {
	it("returns skills of a group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const result = await profileSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.skillId).toBe(skill.id);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.level).toBe(Level.Débutant);
	});

	it("returns empty array if no skill exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const result = await profileSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(0);
	});

	it("does not return skill from another profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const profile2 = await createTestProfile(user2.id, "John2", "Doe2");
		const skillGroup2 = await profileSkillGroupService.create(profile2.id, {
			title: "Skill Group 2",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await profileSkillService.create(skillGroup2.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const result = await profileSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(0);
	});
});

describe("ProfileSkillService.update", () => {
	it("updates a skill", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const result = await profileSkillService.update(profileSkill.id, {
			skillId: skill.id,
			level: Level.Intermédiaire,
		});
		expect(result.id).toBe(profileSkill.id);
		expect(result.skillId).toBe(skill.id);
		expect(result.order).toBe(1);
		expect(result.level).toBe(Level.Intermédiaire);
	});

	it("updates referenced skill", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		const result = await profileSkillService.update(profileSkill.id, {
			skillId: skill2.id,
			level: Level.Intermédiaire,
		});
		expect(result.id).toBe(profileSkill.id);
		expect(result.skillId).toBe(skill2.id);
		expect(result.order).toBe(1);
		expect(result.level).toBe(Level.Intermédiaire);
	});

	it("throws if skill does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			profileSkillService.update(profileSkill.id, {
				skillId: "unknown-skill",
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if referenced skill does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			profileSkillService.update(profileSkill.id, {
				skillId: "unknown-skill",
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new skill already exists in group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		await profileSkillService.create(skillGroup.id, {
			skillId: skill2.id,
			order: 2,
			level: Level.Débutant,
		});
		await expect(
			profileSkillService.update(profileSkill.id, {
				skillId: skill2.id,
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileSkillService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a skill to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup1 = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup1.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		const profileSkill2 = await profileSkillService.create(skillGroup1.id, {
			skillId: skill2.id,
			order: 2,
			level: Level.Débutant,
		});
		await profileSkillService.move(profileSkill.id, 2);
		const result = await profileSkillService.findAllByGroupId(skillGroup1.id);
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
		await expect(profileSkillService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await expect(
			profileSkillService.move(profileSkill.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		return await expectMoveNoOp({
			createEntity: async () => {
				return { id: profileSkill.id, order: profileSkill.order };
			},
			moveEntity: (id, order) => profileSkillService.move(id, order),
		});
	});
});

describe("ProfileSkillService.delete", () => {
	it("deletes a skill", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		await profileSkillService.delete(profileSkill.id);
		const result = await profileSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(0);
	});

	it("throws if skill does not exist", async () => {
		await expect(profileSkillService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("reorders remaining skills", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const profileSkill = await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			order: 1,
			level: Level.Débutant,
		});
		const skill2 = await skillService.create({
			name: "Skill 2",
		});
		const profileSkill2 = await profileSkillService.create(skillGroup.id, {
			skillId: skill2.id,
			order: 2,
			level: Level.Débutant,
		});
		await profileSkillService.delete(profileSkill.id);
		const result = await profileSkillService.findAllByGroupId(skillGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.skillId).toBe(skill2.id);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.level).toBe(Level.Débutant);
	});
});
