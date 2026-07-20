import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";
import type {
	Competence,
	ProfileCompetence,
	ProfileCompetenceGroup,
} from "../../generated/prisma/client";

describe("Competence model", () => {
	//? 11 tests pour le model Competence => 11 tests ok
	// model Competence {
	//   id   String @id @default(cuid())
	//   name String @unique // compétences globales
	//   profileCompetences ProfileCompetence[]
	//   cvCompetences      CvCompetence[]
	// }

	// model ProfileCompetenceGroup {
	//   id        String @id @default(cuid())
	//   title     String?                     // titre du groupe, optionnel
	//   order     Int @default(0)             // pour trier les groupes
	//   competences    ProfileCompetence[]              // compétences dans ce groupe
	//   profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId String
	//   @@unique([profileId, order]) // pas de doublon dans un profile
	// }

	// model ProfileCompetence {
	//   id           String @id @default(cuid())
	//   competence        Competence  @relation(fields: [competenceId], references: [id])
	//   competenceId      String
	//   group        ProfileCompetenceGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
	//   groupId      String
	//   @@unique([groupId, competenceId]) // pas de doublon dans un groupe
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des compétences
		it("should create a profile with competences", async () => {
			const user = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Langages",
						order: 1,
						competences: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			const competenceNames = user
				.profile!.competences! /*as (ProfileCompetenceGroup & {
        competences: (ProfileCompetence & { competence: Competence })[];
      })[]*/
				.flatMap(
					(
						group: ProfileCompetenceGroup & {
							competences: (ProfileCompetence & { competence: Competence })[];
						},
					) =>
						group.competences.map(
							(pc: ProfileCompetence & { competence: Competence }) =>
								pc.competence.name,
						),
				);
			expect(competenceNames).toContain("TypeScript");
			expect(user.profile.competences!.length).toBe(1); // 1 groupe
		});

		// 1-2: peut créer deux profiles avec la même compétence
		it("should allow two profiles to share the same competence", async () => {
			const user1 = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Langages",
						order: 1,
						competences: [{ name: "typescript", order: 1 }],
					},
				],
			});

			const user2 = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Frontend",
						order: 1,
						competences: [{ name: "typescript", order: 1 }],
					},
				],
			});

			const competences = await prismaTest.competence.findMany();
			const profileCompetences = await prismaTest.profileCompetence.findMany();

			expect(competences.length).toBe(1); // une seule competence globale
			expect(profileCompetences.length).toBe(2); // deux liens
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un profileCompetence sans un groupe
		it("should not create a profileCompetence without a group", async () => {
			const user = await createTestUserWithProfile();

			// Essayer de créer un profileCompetence sans groupe
			await expect(
				prismaTest.profileCompetence.create({
					// @ts-expect-error - group is required
					data: {
						competence: { create: { name: "TypeScript" } },
						// group: missing !!
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer un groupe de compétences sans un profile
		it("should not create a competence group without profile", async () => {
			await expect(
				prismaTest.profileCompetenceGroup.create({
					data: {
						title: "Langages",
						competences: {
							create: [{ competence: { create: { name: "TypeScript" } } }],
						},
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer un competence avec un nom déjà existant
		it("should not allow duplicate competence names", async () => {
			await prismaTest.competence.create({
				data: { name: "TypeScript" },
			});

			await expect(
				prismaTest.competence.create({
					data: { name: "TypeScript" },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut rajouter un skill dans un groupe
		it("should add a competence to a group", async () => {
			const user = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Langages",
						order: 1,
						competences: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			const competenceGroups = user.profile!.competences!;
			await prismaTest.profileCompetence.create({
				data: {
					competence: {
						connectOrCreate: {
							where: { name: "react" },
							create: { name: "react" },
						},
					},
					group: { connect: { id: competenceGroups[0]!.id } },
				},
			});
			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
				include: {
					competences: {
						include: { competences: { include: { competence: true } } },
					},
				},
			});
			const allCompetences = updatedProfile!.competences!.flatMap((group) =>
				group.competences.map((ps) => ps.competence.name),
			);
			expect(allCompetences).toContain("TypeScript");
			expect(allCompetences).toContain("react");
			expect(allCompetences.length).toBe(2);
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas créer un competence avec un nom déjà existant dans le même groupe
		it("should not allow duplicate competence in same group", async () => {
			const user = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Langages",
						order: 1,
						competences: [{ name: "TypeScript", order: 1 }],
					},
				],
			});

			const group = user.profile!.competences![0]!;

			await expect(
				prismaTest.profileCompetence.create({
					data: {
						competence: { connect: { name: "TypeScript" } },
						group: { connect: { id: group.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas créer un groupe avec un order déjà existant dans le même profile
		it("should not allow duplicate group order for same profile", async () => {
			const user = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Langages",
						order: 1,
						competences: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			await expect(
				prismaTest.profileCompetenceGroup.create({
					data: { title: "Langages", order: 1, profileId: user.profile.id },
				}),
			).rejects.toThrow();
		});
	});

	//! 5 - DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer une compétence d'un groupe
		it("should delete a competence from a group", async () => {
			const user = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Langages",
						order: 1,
						competences: [
							{ name: "TypeScript", order: 1 },
							{ name: "React", order: 2 },
						],
					},
				],
			});
			const competence = user.profile!.competences![0]!.competences![0]!;
			await prismaTest.profileCompetence.delete({
				where: { id: competence.id },
			});
			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
				include: {
					competences: {
						include: { competences: true },
					},
				},
			});
			expect(updatedProfile!.competences!.length).toBe(1);
			expect(updatedProfile!.competences![0]!.competences.length).toBe(1);
		});

		// 5-2: peut supprimer un groupe de compétences
		it("should delete a competence group", async () => {
			const user = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Langages",
						order: 1,
						competences: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			await prismaTest.profileCompetenceGroup.delete({
				where: { id: user.profile!.competences![0]!.id },
			});
			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
				include: {
					competences: {
						include: { competences: true },
					},
				},
			});
			expect(updatedProfile!.competences!.length).toBe(0);
		});

		// 5-3: supprime les compétences quand le profile est supprimé
		it("should delete the competences when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				competenceGroups: [
					{
						title: "Langages",
						order: 1,
						competences: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const profilecompetences = await prismaTest.profileCompetence.findMany({
				where: { group: { profileId: user.profile.id } },
			});
			const competenceGroups = await prismaTest.profileCompetenceGroup.findMany(
				{
					where: { profileId: user.profile.id },
				},
			);
			const competences = await prismaTest.competence.findMany();
			expect(competenceGroups!.length).toBe(0);
			expect(profilecompetences!.length).toBe(0);
			expect(competences!.length).toBe(1);
		});
	});

	//! 6- RELATIONS TESTS
	// describe('RELATIONS', () => {});
});
