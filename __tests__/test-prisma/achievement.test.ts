import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Achievement model", () => {
	//? 16 tests pour le model Achievement => 16 tests ok
	// model Achievement {
	//   id          String @id @default(cuid())
	//   title       String
	//   description String?
	//   year        Int?
	//   technology  String?

	//   order       Int @default(0)
	//   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId   String

	//   @@unique([profileId, title])
	//   @@unique([profileId, order]) // pas de doublon dans un profile
	//   @@index([profileId])
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des réalisations
		it("should create a profile with achievements", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "Réalisation 1",
						description: "Description 1",
						year: 2020,
						technology: "Technology 1",
						order: 1,
					},
				],
			});
			const achievement = user.profile!.achievements![0]!;
			expect(achievement.title).toBe("Réalisation 1");
			expect(achievement.year).toBe(2020);
			expect(achievement.technology).toBe("Technology 1");
			expect(achievement.description).toBe("Description 1");
			expect(achievement.order).toBe(1);
		});

		// 1-2: peut créer une réalisation sans technology si optional
		it("should create achievement without technology if optional", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "Test",
						year: 2020,
						order: 1,
					},
				],
			});

			const achievement = user.profile.achievements![0];
			expect(achievement!.technology).toBeNull();
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer une réalisation avec un year de type string
		it("should not create an achievement with invalid year type", async () => {
			const user = await createTestUserWithProfile();

			await expect(
				prismaTest.achievement.create({
					data: {
						title: "Test",
						description: "Test",
						// @ts-expect-error - year doit être un Int
						year: "2020",
						technology: "Test",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer une réalisation sans un profile
		it("should not create an achievement without a profile", async () => {
			await expect(
				prismaTest.achievement.create({
					data: {
						title: "Réalisation 1",
						description: "Description 1",
						year: 2020,
						technology: "Technology 1",
						order: 1,
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer une réalisation sans un title
		it("should not create an achievement without a title", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.achievement.create({
					// @ts-expect-error - title is required
					data: {
						description: "Description 1",
						year: 2020,
						technology: "Technology 1",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer une réalisation avec un order déjà existant
		it("should not allow duplicate order for same profile", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "A",
						description: "A",
						year: 2020,
						technology: "T",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.achievement.create({
					data: {
						title: "B",
						description: "B",
						year: 2020,
						technology: "T",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-5: ne peut pas duplicate le title lors d'un create
		it("should not allow duplicate title for same profile", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "Projet A",
						description: "Desc",
						year: 2020,
						technology: "Tech",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.achievement.create({
					data: {
						title: "Projet A",
						description: "Another",
						year: 2021,
						technology: "Other",
						order: 2,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour une réalisation
		it("should update an achievement", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "Réalisation 1",
						description: "Description 1",
						year: 2020,
						technology: "Technology 1",
						order: 1,
					},
				],
			});
			const achievement = await prismaTest.achievement.update({
				where: { id: user.profile.achievements![0]!.id },
				data: { title: "Réalisation 2" },
			});
			expect(achievement.title).toBe("Réalisation 2");
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas duplicate le title lors d'un update
		it("should not allow duplicate title on update", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "A",
						description: "A",
						year: 2020,
						technology: "T",
						order: 1,
					},
					{
						title: "B",
						description: "B",
						year: 2020,
						technology: "T",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.achievement.update({
					where: { id: user.profile.achievements![1]!.id },
					data: { title: "A" },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});

		// 4-2: ne peut pas duplicate le order lors d'un update
		it("should not allow duplicate order on update", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "A",
						description: "A",
						year: 2020,
						technology: "T",
						order: 1,
					},
					{
						title: "B",
						description: "B",
						year: 2020,
						technology: "T",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.achievement.update({
					where: { id: user.profile.achievements![1]!.id },
					data: { order: 1 },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});

		// 4-3: ne peut pas duplicate le title lors d'un update
		it("should not allow duplicate title on update", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "A",
						description: "A",
						year: 2020,
						technology: "T",
						order: 1,
					},
					{
						title: "B",
						description: "B",
						year: 2020,
						technology: "T",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.achievement.update({
					where: { id: user.profile.achievements![1]!.id },
					data: { title: "A" },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});

		// 4-4: ne peut pas duplicate le order lors d'un update
		it("should not allow duplicate order on update", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "A",
						description: "A",
						year: 2020,
						technology: "T",
						order: 1,
					},
					{
						title: "B",
						description: "B",
						year: 2020,
						technology: "T",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.achievement.update({
					where: { id: user.profile.achievements![1]!.id },
					data: { order: 1 },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer une réalisation
		it("should delete an achievement", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "Réalisation 1",
						description: "Description 1",
						year: 2020,
						technology: "Technology 1",
						order: 1,
					},
				],
			});
			const before = await prismaTest.achievement.findMany({
				where: { profileId: user.profile.id },
			});
			expect(before!.length).toBe(1);
			await prismaTest.achievement.delete({
				where: { id: user.profile.achievements![0]!.id },
			});
			const achievements = await prismaTest.achievement.findMany({
				where: { profileId: user.profile.id },
			});
			expect(achievements!.length).toBe(0);
		});

		// 5-2: supprime les réalisations quand le profile est supprimé
		it("should delete the achievements when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "Réalisation 1",
						description: "Description 1",
						year: 2020,
						technology: "Technology 1",
						order: 1,
					},
				],
			});
			expect(user.profile.achievements!.length).toBe(1);
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const achievements = await prismaTest.achievement.findMany({
				where: { profileId: user.profile.id },
			});
			expect(achievements!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: garde le bon ordre des réalisations
		it("should keep the correct order of achievements", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "Réalisation 1",
						description: "Description 1",
						year: 2020,
						technology: "Technology 1",
						order: 1,
					},
					{
						title: "Réalisation 2",
						description: "Description 2",
						year: 2020,
						technology: "Technology 2",
						order: 2,
					},
				],
			});
			const achievements = await prismaTest.achievement.findMany({
				where: { profileId: user.profile.id },
				orderBy: { order: "asc" },
			});
			expect(achievements[0]!.order).toBe(1);
			expect(achievements[1]!.order).toBe(2);
		});

		// 6-2: vérifie que la réalisation est liée au bon profile
		it("should link achievement to correct profile", async () => {
			const user = await createTestUserWithProfile({
				achievements: [
					{
						title: "Test",
						description: "Test",
						year: 2020,
						technology: "Tech",
						order: 1,
					},
				],
			});

			const achievement = await prismaTest.achievement.findUnique({
				where: { id: user.profile.achievements![0]!.id },
				include: { profile: true },
			});

			expect(achievement!.profileId).toBe(user.profile.id);
			expect(achievement!.profile.id).toBe(user.profile.id);
		});
	});
});
