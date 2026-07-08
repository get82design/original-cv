import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Experience model", () => {
	//? 17 tests pour le model Experience => 17 tests ok
	// model Experience {
	//   id          String   @id @default(cuid())
	//   title       String
	//   company     String
	//   start       DateTime
	//   end         DateTime?
	//   location    String?
	//   description String?
	//   missions    MissionExperience[]

	//   order       Int @default(0)
	//   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId   String

	//   @@unique([profileId, title]) // pas de doublon dans un profile
	//   @@unique([profileId, order]) // pas de doublon dans un profile
	//   @@index([profileId])
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des experiences
		it("should create a profile with experiences", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Experience 1",
						description: "Description 1",
						company: "Company 1",
						start: new Date(),
						end: new Date(),
						location: "Location 1",
						missions: ["Mission 1"],
						order: 1,
					},
				],
			});

			expect(user.profile.experiences).toBeDefined();
			expect(user.profile.experiences!.length).toBe(1);
		});

		// 1-2: peut créer des missions liées à une experience
		it("should create missions linked to an experience", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Experience 1",
						description: "Description 1",
						company: "Company 1",
						start: new Date(),
						end: new Date(),
						location: "Location 1",
						missions: ["Mission 1", "Mission 2"],
						order: 1,
					},
				],
			});

			const experience = await prismaTest.experience.findUnique({
				where: { id: user.profile.experiences![0]!.id },
				include: { missions: true },
			});

			expect(experience!.missions.length).toBe(2);
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas ajouter une experience sans un profile
		it("should not add an experience without a profile", async () => {
			await expect(
				prismaTest.experience.create({
					data: {
						title: "Experience 1",
						company: "Company 1",
						start: new Date(),
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas ajouter une experience sans un title
		it("should not add an experience without a title", async () => {
			await expect(
				prismaTest.experience.create({
					// @ts-expect-error - title is required
					data: {
						company: "Company 1",
						start: new Date(),
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas ajouter une experience sans un company
		it("should not add an experience without a company", async () => {
			await expect(
				prismaTest.experience.create({
					// @ts-expect-error - company is required
					data: { title: "Experience 1", start: new Date(), order: 1 },
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas ajouter une experience sans un start
		it("should not add an experience without a start", async () => {
			await expect(
				prismaTest.experience.create({
					// @ts-expect-error - start is required
					data: { title: "Experience 1", company: "Company 1", order: 1 },
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour une experience
		it("should update an experience", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Experience 1",
						description: "Description 1",
						company: "Company 1",
						start: new Date(),
						end: new Date(),
						location: "Location 1",
						missions: ["Mission 1"],
						order: 1,
					},
				],
			});
			const updatedExperience = await prismaTest.experience.update({
				where: { id: user.profile.experiences![0]!.id },
				data: { title: "Experience 2" },
			});
			expect(updatedExperience).toBeDefined();
			expect(updatedExperience.title).toBe("Experience 2");
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas duplicate le title lors d'un update
		it("should not allow duplicate title in same profile", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Experience 1",
						description: "Description 1",
						company: "Company 1",
						start: new Date(),
						end: new Date(),
						location: "Location 1",
						missions: ["Mission 1"],
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.experience.create({
					data: {
						title: "Experience 1",
						company: "Another Company",
						start: new Date(),
						profile: { connect: { id: user.profile.id } },
						order: 2,
					},
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});

		// 4-2: ne peut pas duplicate le order lors d'un update
		it("should not allow duplicate order in same profile", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Exp 1",
						company: "Company",
						start: new Date(),
						order: 1,
						description: "Description 1",
						end: new Date(),
						location: "Location 1",
						missions: ["Mission 1"],
					},
				],
			});

			await expect(
				prismaTest.experience.create({
					data: {
						title: "Exp 2",
						company: "Company",
						start: new Date(),
						profile: { connect: { id: user.profile.id } },
						order: 1,
					},
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});

		// 4-3: ne peut pas duplicate le title lors d'un update
		it("should not allow duplicate title on update within same profile", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Exp 1",
						company: "C1",
						start: new Date(),
						order: 1,
						missions: ["Mission 1"],
						description: "Description 1",
						end: new Date(),
						location: "Location 1",
					},
					{
						title: "Exp 2",
						company: "C2",
						start: new Date(),
						order: 2,
						missions: ["Mission 2"],
						description: "Description 2",
						end: new Date(),
						location: "Location 2",
					},
				],
			});

			await expect(
				prismaTest.experience.update({
					where: { id: user.profile.experiences![1]!.id },
					data: { title: "Exp 1" }, // conflit avec Exp 1
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});

		// 4-4: ne peut pas duplicate le order lors d'un update
		it("should not allow duplicate order on update within same profile", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Exp 1",
						company: "C1",
						start: new Date(),
						order: 1,
						missions: ["Mission 1"],
						description: "Description 1",
						end: new Date(),
						location: "Location 1",
					},
					{
						title: "Exp 2",
						company: "C2",
						start: new Date(),
						order: 2,
						missions: ["Mission 2"],
						description: "Description 2",
						end: new Date(),
						location: "Location 2",
					},
				],
			});

			await expect(
				prismaTest.experience.update({
					where: { id: user.profile.experiences![1]!.id },
					data: { order: 1 }, // conflit avec Exp 1
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer une experience
		it("should delete an experience", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Experience 1",
						description: "Description 1",
						company: "Company 1",
						start: new Date(),
						end: new Date(),
						location: "Location 1",
						missions: ["Mission 1"],
						order: 1,
					},
					{
						title: "Experience 2",
						description: "Description 2",
						company: "Company 2",
						start: new Date(),
						end: new Date(),
						location: "Location 2",
						missions: ["Mission 2"],
						order: 2,
					},
				],
			});
			expect(user.profile.experiences![0]!.order).toBe(1);
			expect(user.profile.experiences![1]!.order).toBe(2);
			await prismaTest.experience.delete({
				where: { id: user.profile.experiences![0]!.id },
			});

			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
				include: { experiences: { orderBy: { order: "asc" } } },
			});

			expect(updatedProfile!.experiences.length).toBe(1);
			expect(updatedProfile!.experiences[0]!.title).toBe("Experience 2");
		});

		// 5-2: peut supprimer les missions liées à une experience
		it("should delete missions when experience is deleted", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Experience 1",
						description: "Description 1",
						company: "Company 1",
						start: new Date(),
						end: new Date(),
						location: "Location 1",
						missions: ["Mission 1"],
						order: 1,
					},
				],
			});

			const expId = user.profile.experiences![0]!.id;

			await prismaTest.experience.delete({ where: { id: expId } });

			const missions = await prismaTest.missionExperience.findMany({
				where: { experienceId: expId },
			});

			expect(missions.length).toBe(0);
		});

		// 5-3: supprime les experiences quand on supprime le profile
		it("should delete the experiences when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Experience 1",
						description: "Description 1",
						company: "Company 1",
						start: new Date(),
						end: new Date(),
						location: "Location 1",
						missions: ["Mission 1"],
						order: 1,
					},
				],
			});
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const experiences = await prismaTest.experience.findMany({
				where: { profileId: user.profile.id },
			});
			expect(experiences!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: peut lier des missions à une experience
		it("should link missions correctly to experience", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Exp 1",
						company: "C1",
						start: new Date(),
						end: new Date(),
						order: 1,
						missions: ["M1", "M2"],
						description: "Description 1",
						location: "Location 1",
					},
				],
			});

			const experience = await prismaTest.experience.findUnique({
				where: { id: user.profile.experiences![0]!.id },
				include: { missions: true },
			});

			expect(experience!.missions.map((m) => m.content)).toEqual(["M1", "M2"]);
			// Vérifier que chaque mission pointe vers la bonne expérience
			experience!.missions.forEach((m) => {
				expect(m.experienceId).toBe(experience!.id);
			});
		});

		// 6-2: supprime les missions quand on supprime une experience
		it("should cascade delete missions when experience is deleted", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Exp 1",
						company: "C1",
						start: new Date(),
						order: 1,
						missions: ["M1"],
						description: "Description 1",
						end: new Date(),
						location: "Location 1",
					},
				],
			});

			const expId = user.profile.experiences![0]!.id;
			await prismaTest.experience.delete({ where: { id: expId } });

			const missions = await prismaTest.missionExperience.findMany({
				where: { experienceId: expId },
			});
			expect(missions.length).toBe(0);
		});

		it("should keep profile linked after experience creation", async () => {
			const user = await createTestUserWithProfile({
				experiences: [
					{
						title: "Exp 1",
						company: "C1",
						start: new Date(),
						order: 1,
						missions: [],
						description: "Description 1",
						end: new Date(),
						location: "Location 1",
					},
				],
			});

			const experience = await prismaTest.experience.findUnique({
				where: { id: user.profile.experiences![0]!.id },
				include: { profile: true },
			});

			expect(experience!.profileId).toBe(user.profile.id);
			expect(experience!.profile.id).toBe(user.profile.id);
		});
	});
});
