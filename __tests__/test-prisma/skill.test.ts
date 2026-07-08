import { describe, expect, it } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { Level } from "../../generated/prisma/enums";

describe("Skill model", () => {
	//? 12 tests pour le model Skill => 12 tests ok
	// model Skill {
	//   id   String @id @default(cuid())
	//   name String @unique // compétences globales

	//   profileSkills ProfileSkill[]
	//   cvSkills      CvSkill[]
	// }

	// model ProfileSkillGroup {
	//   id        String @id @default(cuid())
	//   title     String?                     // titre du groupe, optionnel
	//   order     Int @default(0)             // pour trier les groupes
	//   skills    ProfileSkill[]              // compétences dans ce groupe
	//   profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId String

	//   @@unique([profileId, order]) // pas de doublon dans un profile
	// }

	// model ProfileSkill {
	//   id           String @id @default(cuid())
	//   level        Level
	//   skill        Skill  @relation(fields: [skillId], references: [id])
	//   skillId      String
	//   group        ProfileSkillGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
	//   groupId      String

	//   @@unique([groupId, skillId]) // pas de doublon dans un groupe
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des skills
		it("should create a profile with skills", async () => {
			const user = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [
							{ name: "TypeScript", level: Level.Junior },
							{ name: "Prisma", level: Level.Intermédiaire },
						],
					},
					{
						title: "Frameworks",
						order: 2,
						skills: [{ name: "React", level: Level.Senior }],
					},
				],
			});
			const skillNames = user
				.profile!.skills! /*as (ProfileSkillGroup & {
        skills: (ProfileSkill & { skill: Skill })[];
      })[]*/
				.flatMap((group) => group.skills.map((ps) => ps.skill.name));

			expect(skillNames).toContain("typescript");
			expect(skillNames).toContain("prisma");
			expect(skillNames).toContain("react");
			expect(user.profile.skills!.length).toBe(2); // 2 groupes
		});

		// 1-2: peut créer 2 profiles avec la même skill
		it("should allow two profiles to share the same skill", async () => {
			const user1 = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [{ name: "TypeScript", level: Level.Junior }],
					},
				],
			});
			const user2 = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [{ name: "TypeScript", level: Level.Junior }],
					},
				],
			});
			const skills = await prismaTest.skill.findMany();
			expect(skills).toBeDefined();
			expect(skills!.length).toBe(1);
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un skill sans un groupe
		it("should not create a skill without a group", async () => {
			await expect(
				prismaTest.profileSkill.create({
					// @ts-expect-error
					data: {
						level: Level.Junior,
						skill: { create: { name: "OrphanSkill" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer un groupe de skills sans un profile
		it("should not create a skill group without profile", async () => {
			await expect(
				prismaTest.profileSkillGroup.create({
					// @ts-expect-error
					data: { title: "NoProfileGroup" },
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer un skill avec un nom déjà existant
		it("should not allow duplicate skill names", async () => {
			await prismaTest.skill.create({
				data: { name: "TypeScript" },
			});

			await expect(
				prismaTest.skill.create({
					data: { name: "TypeScript" },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut rajouter un skill dans un groupe
		it("should add a skill to a group", async () => {
			const user = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [{ name: "TypeScript", level: Level.Junior }],
					},
				],
			});
			const skillGroups = user.profile!.skills!;
			await prismaTest.profileSkill.create({
				data: {
					skill: {
						connectOrCreate: {
							where: { name: "react" },
							create: { name: "react" },
						},
					},
					level: Level.Senior,
					group: { connect: { id: skillGroups[0]!.id } },
				},
			});
			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
				include: {
					skills: { include: { skills: { include: { skill: true } } } },
				},
			});
			const allSkills = updatedProfile!.skills!.flatMap((group) =>
				group.skills.map((ps) => ps.skill.name),
			);
			expect(allSkills).toContain("typescript");
			expect(allSkills).toContain("react");
			expect(allSkills.length).toBe(2);
		});

		// 3-2: peut mettre à jour le niveau d'un skill
		it("should update the level of a skill", async () => {
			const user = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [{ name: "TypeScript", level: Level.Junior }],
					},
				],
			});

			const skill = user.profile!.skills![0]!.skills![0]!;

			const updated = await prismaTest.profileSkill.update({
				where: { id: skill.id },
				data: { level: Level.Senior },
			});

			expect(updated.level).toBe(Level.Senior);
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas créer un skill avec un nom déjà existant dans le même groupe
		it("should not allow duplicate skill in same group", async () => {
			const user = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [{ name: "TypeScript", level: Level.Junior }],
					},
				],
			});

			const group = user.profile!.skills![0]!;

			await expect(
				prismaTest.profileSkill.create({
					data: {
						level: Level.Senior,
						skill: { connect: { name: "typescript" } },
						group: { connect: { id: group.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas créer un groupe avec un order déjà existant dans le même profile
		it("should not allow duplicate group order for same profile", async () => {
			const user = await createTestUserWithProfile({
				skillGroups: [{ title: "G1", order: 1, skills: [] }],
			});

			await expect(
				prismaTest.profileSkillGroup.create({
					data: {
						title: "G2",
						order: 1,
						profileId: user.profile.id,
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: supprime un groupe de skills du profile
		it("should delete a skill group of a profile", async () => {
			const user = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [
							{ name: "TypeScript", level: Level.Junior },
							{ name: "Prisma", level: Level.Intermédiaire },
						],
					},
					{
						title: "Frameworks",
						order: 2,
						skills: [{ name: "React", level: Level.Senior }],
					},
				],
			});
			const updatedProfile = await prismaTest.profile.update({
				where: { id: user.profile.id },
				data: { skills: { delete: { id: user.profile.skills![0]!.id } } },
				include: {
					skills: {
						include: {
							skills: {
								include: { skill: true },
							},
						},
					},
				},
			});
			const skillNames = updatedProfile
				.skills! /*as (ProfileSkillGroup & {
        skills: (ProfileSkill & { skill: Skill })[];
      })[]*/
				.flatMap((group) => group.skills.map((ps) => ps.skill.name));

			expect(updatedProfile.skills).toBeDefined();
			expect(updatedProfile.skills!.length).toBe(1);
			expect(skillNames).toContain("react");
			expect(skillNames).not.toContain("typescript");
			expect(skillNames).not.toContain("prisma");
		});

		// 5-2: supprime un skill d'un groupe
		it("should delete a skill of a group", async () => {
			const user = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [
							{ name: "TypeScript", level: Level.Junior },
							{ name: "Prisma", level: Level.Intermédiaire },
						],
					},
					{
						title: "Frameworks",
						order: 2,
						skills: [{ name: "React", level: Level.Senior }],
					},
				],
			});
			// Récupérer le skill à supprimer par nom
			const skillToDelete = user
				.profile!.skills!.flatMap((g) => g.skills!)
				.find((ps) => ps.skill.name === "typescript")!;

			await prismaTest.profileSkill.delete({ where: { id: skillToDelete.id } });

			// Puis récupérer le profil mis à jour
			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile!.id },
				include: {
					skills: {
						include: {
							skills: { include: { skill: true } },
						},
					},
				},
			});
			const skillNames = updatedProfile!
				.skills! /*as (ProfileSkillGroup & {
        skills: (ProfileSkill & { skill: Skill })[];
      })[]*/
				.flatMap((group) => group.skills.map((ps) => ps.skill.name));

			expect(updatedProfile!.skills).toBeDefined();
			expect(updatedProfile!.skills!.length).toBe(2);
			expect(skillNames).toContain("react");
			expect(skillNames).not.toContain("typescript");
			expect(skillNames).toContain("prisma");
		});

		// 5-3: supprime les skills quand on supprime le profile
		it("should delete the skills when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				skillGroups: [
					{
						title: "Langages",
						order: 1,
						skills: [
							{ name: "TypeScript", level: Level.Junior },
							{ name: "Prisma", level: Level.Intermédiaire },
						],
					},
					{
						title: "Frameworks",
						order: 2,
						skills: [{ name: "React", level: Level.Senior }],
					},
				],
			});
			await prismaTest.profile.delete({ where: { id: user.profile.id } });

			const profileSkills = await prismaTest.profileSkill.findMany({
				where: { group: { profileId: user.profile.id } },
			});
			const skillGroups = await prismaTest.profileSkillGroup.findMany({
				where: { profileId: user.profile.id },
			});
			const skills = await prismaTest.skill.findMany();
			expect(skills).toBeDefined();
			expect(skills!.length).toBe(3);
			expect(skillGroups).toBeDefined();
			expect(skillGroups!.length).toBe(0);
			expect(profileSkills).toBeDefined();
			expect(profileSkills!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	// describe('RELATIONS', () => {});
});
