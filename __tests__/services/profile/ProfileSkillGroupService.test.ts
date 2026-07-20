import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { skillService } from "../../../src/services/cv/skillService";
import { Level } from "../../../generated/prisma/client";
import { prismaTest } from "../../../lib/prismaTest";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileSkillGroupService } from "../../../src/services/profile/profileSkillGroupService";
import { profileSkillService } from "../../../src/services/profile/profileSkillService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileSkillGroupService.create", () => {
	it("creates a skill group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		expect(skillGroup.title).toBe("Skill Group 1");
		expect(skillGroup.order).toBe(1);
	});

	it("throws if Profile does not exist", async () => {
		await expect(
			profileSkillGroupService.create("unknown-profile", {
				title: "Skill Group 1",
				order: 1,
				skills: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await expect(
			profileSkillGroupService.create(profile.id, {
				title: "Skill Group 1",
				order: 1,
				skills: [],
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await expect(
			profileSkillGroupService.create(profile.id, {
				title: "Skill Group 2",
				order: 1,
				skills: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileSkillGroupService.findAllByProfileId", () => {
	it("finds all skill groups by Profile ID", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skillGroup2 = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		const skillGroups = await profileSkillGroupService.findAllByProfileId(
			profile.id,
		);
		expect(skillGroups.length).toBe(2);
		expect(skillGroups[0]?.title).toBe("Skill Group 1");
		expect(skillGroups[0]?.order).toBe(1);
		expect(skillGroups[1]?.title).toBe("Skill Group 2");
		expect(skillGroups[1]?.order).toBe(2);
	});

	it("returns empty array if no skill groups exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroups = await profileSkillGroupService.findAllByProfileId(
			profile.id,
		);
		expect(skillGroups).toEqual([]);
	});

	it("return only skill groups for the given profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const profile2 = await createTestProfile(user2.id, "John2", "Doe2");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await profileSkillGroupService.create(profile2.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		const skillGroups = await profileSkillGroupService.findAllByProfileId(
			profile.id,
		);
		expect(skillGroups.length).toBe(1);
		expect(skillGroups[0]?.title).toBe("Skill Group 1");
		expect(skillGroups[0]?.order).toBe(1);
	});
});

describe("ProfileSkillGroupService.update", () => {
	it("updates a skill group by ID", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const updatedSkillGroup = await profileSkillGroupService.update(
			skillGroup.id,
			{
				title: "Skill Group 2",
				skills: [],
			},
		);
		expect(updatedSkillGroup.title).toBe("Skill Group 2");
		expect(updatedSkillGroup.order).toBe(1);
	});

	it("throws if skill group does not exist", async () => {
		await expect(
			profileSkillGroupService.update("unknown-skill-group", {
				title: "Skill Group 2",
				skills: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		await expect(
			profileSkillGroupService.update(skillGroup.id, {
				title: "Skill Group 2",
				skills: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileSkillGroupService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a skill group to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup1 = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skillGroup2 = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		await profileSkillGroupService.move(skillGroup2.id, 1);
		const result = await profileSkillGroupService.findAllByProfileId(
			profile.id,
		);

		expect(result[0]!.id).toBe(skillGroup2.id);
		expect(result[1]!.id).toBe(skillGroup1.id);
	});

	// TEST 2 : skill group inexistant
	it("throws if skill group does not exist", async () => {
		await expect(
			profileSkillGroupService.move("unknown-id", 1),
		).rejects.toThrow(NotFoundError);
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
		await expect(
			profileSkillGroupService.move(skillGroup.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const skillGroup = await profileSkillGroupService.create(profile.id, {
					title: "Skill Group 1",
					order: 1,
					skills: [],
				});
				return { id: skillGroup.id, order: skillGroup.order };
			},
			moveEntity: (id, order) => profileSkillGroupService.move(id, order),
		});
	});
});

describe("ProfileSkillGroupService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a skill group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		await profileSkillGroupService.delete(skillGroup.id);
		const result = await profileSkillGroupService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : skill group inexistant
	it("throws if skill group does not exist", async () => {
		await expect(profileSkillGroupService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : réorganisation des skill groups après suppression
	it("reorders remaining skill groups after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skillGroup2 = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 2",
			order: 2,
			skills: [],
		});
		await profileSkillGroupService.delete(skillGroup.id);
		const result = await profileSkillGroupService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(1);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.title).toBe("Skill Group 2");
	});

	it("deletes related skills when deleting group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const skillGroup = await profileSkillGroupService.create(profile.id, {
			title: "Skill Group 1",
			order: 1,
			skills: [],
		});
		const skill = await skillService.create({ name: "Skill 1" });
		await profileSkillService.create(skillGroup.id, {
			skillId: skill.id,
			level: Level.Débutant,
			order: 1,
		});
		await profileSkillGroupService.delete(skillGroup.id);
		// Skills supprimés
		const profileSkills = await prismaTest.profileSkill.findMany({
			where: { groupId: skillGroup.id },
		});
		expect(profileSkills).toHaveLength(0);
		// Skill catalogue conservé
		const skills = await skillService.findAll();
		expect(skills).toHaveLength(1);
		expect(skills[0]!.id).toBe(skill.id);
	});
});
