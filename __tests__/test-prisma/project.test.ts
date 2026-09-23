import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Project model", () => {
	//? 23 tests pour le model Project => 23 tests ok
	// model Project {
	//   id          String @id @default(cuid())
	//   title       String
	//   description String?
	//   location    String?
	//   start       DateTime
	//   end         DateTime?
	//   technology  String?
	//   missions    MissionProject[]

	//   order       Int @default(0)
	//   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId   String

	//   @@unique([profileId, title])
	//   @@unique([profileId, order]) // pas de doublon dans un profile
	//   @@index([profileId])
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des projets
		it("should create a profile with projects", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Project 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1"],
						order: 1,
					},
				],
			});
			const project = user.profile!.projects![0]!;
			expect(project.title).toBe("Project 1");
			expect(project.technology).toBe("Technologie 1");
			expect(project.description).toBe("Description 1");
			expect(project.location).toBe("location 1");
			expect(project.order).toBe(1);
		});

		// 1-2: peut créer un projet sans technologie si optional
		it("should create project without technology if optional", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						missions: ["mission 1"],
						order: 1,
					},
				],
			});

			const project = user.profile.projects![0];
			expect(project!.technology).toBeNull();
		});

		// 1-3: peut créer un projet sans end si optional
		it("should allow project without end date", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						location: "location 1",
						missions: ["mission 1"],
						order: 1,
					},
				],
			});

			const project = user.profile.projects![0];
			expect(project!.end).toBeNull();
		});

		// 1-4: peut créer uyn projet sans missions
		it("should allow project without missions", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					// @ts-expect-error
					{
						title: "Projet 3",
						technology: "Tech 3",
						description: "Desc 3",
						start: new Date(),
						order: 1,
					},
				],
			});

			const project = user.profile.projects![0];
			expect(project!.missions).toBeDefined();
			expect(project!.missions!.length).toBe(0);
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un projet sans un profile
		it("should not create an project without a profile", async () => {
			await expect(
				prismaTest.project.create({
					data: {
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						order: 1,
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer un projet sans un title
		it("should not create an project without a title", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.project.create({
					// @ts-expect-error - title is required
					data: {
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer 2 projets avec le même nom dans un profile
		it("should not allow duplicate project title for the same profile", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					// @ts-expect-error
					{
						title: "Projet X",
						technology: "Tech",
						description: "Desc",
						start: new Date(),
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.project.create({
					data: {
						title: "Projet X",
						technology: "Tech2",
						description: "Desc2",
						start: new Date(),
						order: 2,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer un projet sans start date
		it("should not create project without start date", async () => {
			const user = await createTestUserWithProfile();

			await expect(
				prismaTest.project.create({
					// @ts-expect-error
					data: {
						title: "Invalid",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-5: ne peut pas créer un projet avec une date de fin avant la date de début
		// it('should not allow end date before start date', async () => {
		//   const user = await createTestUserWithProfile();

		//   await expect(
		//     prismaTest.project.create({
		//       data: {
		//         title: 'Invalid dates',
		//         start: new Date('2024-01-01'),
		//         end: new Date('2020-01-01'),
		//         order: 1,
		//         profile: { connect: { id: user.profile.id } },
		//       },
		//     }),
		//   ).rejects.toThrow();
		// });
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour un projet
		it("should update a project", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1"],
						order: 1,
					},
				],
			});
			const project = await prismaTest.project.update({
				where: { id: user.profile.projects![0]!.id },
				data: { title: "Projet 2" },
			});
			expect(project.title).toBe("Projet 2");
		});

		// 3-2: tester la mise à jour partielle d'un projet
		it("should update only provided fields", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Test",
						technology: "Tech",
						description: "Desc",
						start: new Date(),
						end: new Date(),
						missions: [],
						order: 1,
					},
				],
			});

			await prismaTest.project.update({
				where: { id: user.profile.projects![0]!.id },
				data: { technology: "React" },
			});

			const updated = await prismaTest.project.findUnique({
				where: { id: user.profile.projects![0]!.id },
			});

			expect(updated!.title).toBe("Test");
			expect(updated!.technology).toBe("React");
		});

		// 3-3: peut ajouter une nouvelle mission à un projet existant
		it("should add a new mission to existing project", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet Add Mission",
						technology: "Tech",
						description: "Desc",
						start: new Date(),
						missions: ["m1"],
						order: 1,
					},
				],
			});

			const projectId = user.profile.projects![0]!.id;

			// await prismaTest.project.update({
			// 	where: { id: projectId },
			// 	data: { missions: { create: [{ content: "m2" }] } },
			// });

			await prismaTest.missionProject.create({
				data: {
					projectId,
					content: "m2",
					order: 2,
				},
			});

			const updatedProject = await prismaTest.project.findUnique({
				where: { id: projectId },
				include: { missions: true },
			});

			const missionContents = updatedProject!.missions.map((m) => m.content);
			expect(missionContents).toContain("m1");
			expect(missionContents).toContain("m2");
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas créer un projet avec un order déjà existant
		it("should not allow duplicate order for same profile", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1"],
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.project.create({
					data: {
						title: "Projet 2",
						technology: "Technologie 2",
						description: "Description 2",
						start: new Date(),
						end: new Date(),
						location: "location 2",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas duplicate le order lors d'un update
		it("should not allow duplicate order on update", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "A",
						start: new Date(),
						missions: [],
						order: 1,
					},
					{
						title: "B",
						start: new Date(),
						missions: [],
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.project.update({
					where: { id: user.profile.projects![1]!.id },
					data: { order: 1 },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});

		// 4-3: ne peut pas duplicate le title lors d'un update
		it("should not allow duplicate title on update", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{ title: "A", start: new Date(), missions: [], order: 1 },
					{ title: "B", start: new Date(), missions: [], order: 2 },
				],
			});

			await expect(
				prismaTest.project.update({
					where: { id: user.profile.projects![1]!.id },
					data: { title: "A" },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer les missions quand le projet est supprimé
		it("should delete missions when project is deleted", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet Mission",
						technology: "Tech",
						description: "Desc",
						start: new Date(),
						missions: ["m1", "m2"],
						order: 1,
					},
				],
			});

			const projectId = user!.profile!.projects![0]!.id;

			await prismaTest.project.delete({ where: { id: projectId } });

			const missions = await prismaTest.missionProject.findMany({
				where: { projectId },
			});
			expect(missions.length).toBe(0);
		});

		// 5-2: peut supprimer un projet
		it("should delete an project", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1", "mission 2"],
						order: 1,
					},
				],
			});
			const before = await prismaTest.project.findMany({
				where: { profileId: user.profile.id },
			});
			expect(before!.length).toBe(1);
			await prismaTest.project.delete({
				where: { id: user.profile.projects![0]!.id },
			});
			const projects = await prismaTest.project.findMany({
				where: { profileId: user.profile.id },
			});
			expect(projects!.length).toBe(0);
		});

		// 5-3: supprime les projets quand le profile est supprimé
		it("should delete the projects when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1", "mission 2"],
						order: 1,
					},
				],
			});
			expect(user.profile.projects!.length).toBe(1);
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const projects = await prismaTest.project.findMany({
				where: { profileId: user.profile.id },
			});
			expect(projects!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: garde le bon ordre des projets
		it("should keep the correct order of projects", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1"],
						order: 1,
					},
					{
						title: "Projet 2",
						technology: "Technologie 2",
						description: "Description 2",
						start: new Date(),
						end: new Date(),
						location: "location 2",
						missions: ["mission 2"],
						order: 2,
					},
				],
			});
			const projects = await prismaTest.project.findMany({
				where: { profileId: user.profile.id },
				orderBy: { order: "asc" },
			});
			expect(projects[0]!.order).toBe(1);
			expect(projects[1]!.order).toBe(2);
		});

		// 6-2: vérifie que le projet est lié au bon profile
		it("should link project to the correct profile", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1"],
						order: 1,
					},
				],
			});

			const project = await prismaTest.project.findUnique({
				where: { id: user.profile.projects![0]!.id },
			});

			expect(project!.profileId).toBe(user.profile.id);
		});

		// 6-3: 2 profile peuvent avoir le même order
		it("should allow same order for different profiles", async () => {
			await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1"],
						order: 1,
					},
				],
			});

			await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 2",
						technology: "Technologie 2",
						description: "Description 2",
						start: new Date(),
						end: new Date(),
						location: "location 2",
						missions: [],
						order: 1,
					},
				],
			});

			const projects = await prismaTest.project.findMany();
			expect(projects.length).toBe(2);
		});

		// 6-4: tester le champ mission
		it("should store missions as array", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Projet 1",
						technology: "Technologie 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						location: "location 1",
						missions: ["mission 1", "mission 2"],
						order: 1,
					},
				],
			});

			const project = user.profile.projects![0];
			expect(project!.missions.length).toBe(2);
			const missionContents = project!.missions.map((m) => m.content);
			expect(missionContents).toContain("mission 1");
			expect(missionContents).toContain("mission 2");
		});

		// 6-5: order est 0 par défaut
		it("should set order to 0 by default", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Default order",
						start: new Date(),
						missions: [],
					},
				],
			});

			const project = user.profile.projects![0];
			expect(project!.order).toBe(0);
		});

		// 6-6: peut mettre à jour une mission d'un projet
		it("should update a project mission", async () => {
			const user = await createTestUserWithProfile({
				projects: [
					{
						title: "Project",
						start: new Date(),
						missions: ["old mission"],
						order: 1,
					},
				],
			});

			const projectId = user.profile.projects![0]!.id;

			const mission = await prismaTest.missionProject.findFirst({
				where: { projectId },
			});

			await prismaTest.missionProject.update({
				where: { id: mission!.id },
				data: { content: "new mission" },
			});

			const updated = await prismaTest.missionProject.findUnique({
				where: { id: mission!.id },
			});

			expect(updated!.content).toBe("new mission");
		});
	});
});
