import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUserWithTemplateAndCV } from "../utils/create-test-user-with-template-and-cv";
import { Level } from "../../generated/prisma/enums";

describe("Skill, CvSkillGroup, CvSkill models", () => {
	//? 7 tests pour le model Skill => 7 tests ok
	// model Skill {
	//   id   String @id @default(cuid())
	//   name String @unique // compétences globales

	//   profileSkills ProfileSkill[]
	//   cvSkills      CvSkill[]
	// }

	//   model CvSkillGroup {
	//     id    String @id @default(cuid())
	//     title String?
	//     order  Int @default(0)
	//     skills CvSkill[]
	//     cv    CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     cvId  String
	//     @@unique([cvId, order]) // pas de doublon dans un cv
	//   }

	//   model CvSkill {
	//     id      String @id @default(cuid())
	//     level   Level
	//     skill   Skill  @relation(fields: [skillId], references: [id])
	//     skillId String
	//     group   CvSkillGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
	//     groupId String
	//     @@unique([groupId, skillId])
	//   }

	//! 1- SKILL TESTS
	describe("Skill model", () => {
		// 1-1: créer une skill
		it("should create a skill", async () => {
			const skill = await prismaTest.skill.create({
				data: { name: "JavaScript" },
			});
			expect(skill.name).toBe("JavaScript");
		});

		// 1-2: ne pas pouvoir créer une skill avec un nom déjà existant
		it("should not allow duplicate skill names", async () => {
			await prismaTest.skill.create({ data: { name: "JavaScript" } });
			await expect(
				prismaTest.skill.create({ data: { name: "JavaScript" } }),
			).rejects.toThrow();
		});

		// 1-3: peut créer un skill dans un cv
		it("should create a skill in a cv", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();
			const cv = await prismaTest.cV.create({
				data: { title: "CV 1", userId: user.id, templateId: template.id },
			});
			const skill = await prismaTest.skill.create({
				data: { name: "JavaScript" },
			});
			const group = await prismaTest.cvSkillGroup.create({
				data: { title: "Frontend", order: 1, cvId: cv.id },
			});
			const cvSkill = await prismaTest.cvSkill.create({
				data: { level: Level.Débutant, skillId: skill.id, groupId: group.id },
			});
			expect(cvSkill.skillId).toBe(skill.id);
			expect(cvSkill.groupId).toBe(group.id);
			expect(cvSkill.level).toBe(Level.Débutant);
		});
	});

	//! 2- CV SKILL GROUP TESTS
	describe("CvSkillGroup model", () => {
		// 2-1: créer un groupe de skills pour un CV
		it("should create a CvSkillGroup for a CV", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();
			const cv = await prismaTest.cV.create({
				data: { title: "CV 1", userId: user.id, templateId: template.id },
			});

			const group = await prismaTest.cvSkillGroup.create({
				data: { title: "Frontend", order: 1, cvId: cv.id },
			});

			expect(group.title).toBe("Frontend");
			expect(group.order).toBe(1);
			expect(group.cvId).toBe(cv.id);
		});

		// 2-2: ne pas pouvoir créer un groupe de skills avec un order déjà existant pour le même CV
		it("should not allow duplicate order for same CV", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();
			const cv = await prismaTest.cV.create({
				data: { title: "CV 1", userId: user.id, templateId: template.id },
			});

			await prismaTest.cvSkillGroup.create({ data: { order: 1, cvId: cv.id } });

			await expect(
				prismaTest.cvSkillGroup.create({ data: { order: 1, cvId: cv.id } }),
			).rejects.toThrow();
		});
	});

	//! 3- CV SKILL TESTS
	describe("CvSkill model", () => {
		// 3-1: créer un skill dans un groupe de skills pour un CV
		it("should create a CvSkill linking a Skill to a CvSkillGroup", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();
			const cv = await prismaTest.cV.create({
				data: { title: "CV 1", userId: user.id, templateId: template.id },
			});

			const skill = await prismaTest.skill.create({
				data: { name: "TypeScript" },
			});
			const group = await prismaTest.cvSkillGroup.create({
				data: { title: "Frontend", order: 1, cvId: cv.id },
			});

			const cvSkill = await prismaTest.cvSkill.create({
				data: {
					level: Level.Intermédiaire,
					skillId: skill.id,
					groupId: group.id,
				},
			});

			expect(cvSkill.skillId).toBe(skill.id);
			expect(cvSkill.groupId).toBe(group.id);
			expect(cvSkill.level).toBe(Level.Intermédiaire);
		});

		// 3-2: ne pas pouvoir créer un skill avec un nom déjà existant dans le même groupe
		it("should not allow duplicate skill in the same group", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();
			const cv = await prismaTest.cV.create({
				data: { title: "CV 1", userId: user.id, templateId: template.id },
			});

			const skill = await prismaTest.skill.create({ data: { name: "React" } });
			const group = await prismaTest.cvSkillGroup.create({
				data: { title: "Frontend", order: 1, cvId: cv.id },
			});

			await prismaTest.cvSkill.create({
				data: { level: Level.Débutant, skillId: skill.id, groupId: group.id },
			});

			await expect(
				prismaTest.cvSkill.create({
					data: { level: Level.Expert, skillId: skill.id, groupId: group.id },
				}),
			).rejects.toThrow(); // @@unique([groupId, skillId])
		});
	});
});
