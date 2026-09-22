import { describe, expect, it } from "vitest";
import { skillService } from "../../../src/services/commons/skillService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvService } from "../../../src/services/cv/cvService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { cvSkillGroupService } from "../../../src/services/cv/cvSkillGroupService";
import { Level } from "../../../generated/prisma/client";
import { cvSkillService } from "../../../src/services/cv/cvSkillService";

describe("SkillService.create", () => {
	it("creates a skill", async () => {
		const skill = await skillService.create({
			name: "Skill 1",
		});
		expect(skill.name).toBe("Skill 1");
	});

	it("returns existing skill if it already exists", async () => {
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const existingSkill = await skillService.create({
			name: "Skill 1",
		});
		expect(existingSkill.id).toBe(skill.id);
	});

	it("trims and lowercases skill name", async () => {
		const skill = await skillService.create({
			name: " React ",
		});

		expect(skill.name).toBe("React");
	});
});

describe("SkillService.findAll", () => {
	it("returns all skills sorted by name", async () => {
		await skillService.create({
			name: "Skill 1",
		});
		await skillService.create({
			name: "Experience 2",
		});
		await skillService.create({
			name: "Skill 3",
		});
		const skills = await skillService.findAll();
		expect(skills).toHaveLength(3);
		expect(skills[0]!.name).toBe("Experience 2");
		expect(skills[1]!.name).toBe("Skill 1");
		expect(skills[2]!.name).toBe("Skill 3");
	});

	it("returns empty array if no skill exists", async () => {
		const result = await skillService.findAll();

		expect(result).toEqual([]);
	});
});

describe("SkillService.update", () => {
	it("updates a skill", async () => {
		const skill = await skillService.create({
			name: "Skill 1",
		});
		const updatedSkill = await skillService.update(skill.id, {
			name: "Skill 2",
		});
		expect(updatedSkill.name).toBe("Skill 2");
	});

	it("throws if skill does not exist", async () => {
		await expect(
			skillService.update("unknown-id", {
				name: "React",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new name already exists", async () => {
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await skillService.create({
			name: "Skill 2",
		});
		await expect(
			skillService.update(skill.id, {
				name: "Skill 2",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("SkillService.delete", () => {
	it("deletes a skill", async () => {
		const skill = await skillService.create({
			name: "Skill 1",
		});
		await skillService.delete(skill.id);
		const skills = await skillService.findAll();
		expect(skills).toHaveLength(0);
	});

	it("throws if skill does not exist", async () => {
		await expect(skillService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	it("throws if skill is used", async () => {
		const skill = await skillService.create({
			name: "React",
		});

		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await cvService.create({
			userId: user.id,
			templateId: template.id,
			title: "Mon CV",
		});

		const group = await cvSkillGroupService.create(cv.id, {
			title: "Group 1",
			order: 1,
			skills: [],
		});

		await cvSkillService.create(group.id, {
			skillId: skill.id,
			level: Level.Expert,
			order: 1,
		});

		await expect(skillService.delete(skill.id)).rejects.toThrow(ConflictError);
	});
});
