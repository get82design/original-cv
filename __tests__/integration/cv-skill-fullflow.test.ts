import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";
import { Level } from "../../generated/prisma/enums";

describe("CV Fullflow Integration with skills", () => {
	it("should create a CV with skill group and skills", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const skillGroup = await utils.createSkillGroup(cv.id, "Skills", 1);
		const skill = await utils.createSkill("JavaScript");
		await utils.addSkillToGroup(skill.id, skillGroup.id, Level.Expert);

		const dbCV = await prismaTest.cV.findUnique({
			where: { id: cv.id },
			include: {
				skillGroups: { include: { skills: { include: { skill: true } } } },
			},
		});

		expect(dbCV!.skillGroups[0]!.skills[0]!.skill.name).toBe("JavaScript");
	});

	it("should cascade delete CV modules and items", async () => {
		const { user, template } = await utils.createUserAndTemplate(
			"delete@fullflow.com",
		);
		const cv = await utils.createCV(user.id, template.id);
		const skillGroup = await utils.createSkillGroup(cv.id, "Skills", 1);
		const skill = await utils.createSkill("TypeScript");
		await utils.addSkillToGroup(skill.id, skillGroup.id, Level.Intermédiaire);

		await prismaTest.cV.delete({ where: { id: cv.id } });

		const dbModules = await prismaTest.cvSkillGroup.findMany({
			where: { cvId: cv.id },
		});
		const dbSkills = await prismaTest.cvSkill.findMany();
		expect(dbModules.length).toBe(0);
		expect(dbSkills.length).toBe(0);
	});
});
