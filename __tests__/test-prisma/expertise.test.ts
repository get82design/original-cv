import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Expertise model", () => {
	//? 17 tests pour le model Expertise => 17 tests ok
	// model Expertise {
	//   id          String @id @default(cuid())
	//   title       String
	//   level       Level

	//   order       Int @default(0)
	//   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId   String

	//   @@unique([profileId, title])
	//   @@unique([profileId, order]) // pas de doublon dans un profile
	//   @@index([profileId])
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des expertises
		it("should create a profile with expertises", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});
			const expertise = user.profile!.expertises![0]!;
			expect(expertise.title).toBe("React");
			expect(expertise.level).toBe("Expert");
			expect(expertise.order).toBe(1);
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer une expertise sans un profile
		it("should not create an expertise without a profile", async () => {
			await expect(
				prismaTest.expertise.create({
					data: {
						title: "React",
						level: "Expert",
						order: 1,
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer une expertise sans un title
		it("should not create an expertise without a title", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.expertise.create({
					// @ts-expect-error - title is required
					data: {
						level: "Expert",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer une expertise sans un level
		it("should not create an expertise without a level", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.expertise.create({
					// @ts-expect-error - title is required
					data: {
						title: "React",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer un expertise avec un order déjà existant
		it("should not allow duplicate order for same profile", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.expertise.create({
					data: {
						title: "Vue",
						level: "Expert",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-5: ne peut pas créer 2 expertises avec le même title dans un profile
		it("should not allow duplicate expertise title for the same profile", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.expertise.create({
					data: {
						title: "React",
						level: "Débutant",
						order: 2,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-6: ne peut pas créer une expertise avec un level invalide
		it("should not allow invalid level value", async () => {
			const user = await createTestUserWithProfile();

			await expect(
				prismaTest.expertise.create({
					data: {
						title: "NodeJS",
						// @ts-expect-error
						level: "SuperExpert",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour une expertise avec un level
		it("should update a expertise with a level", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});
			const expertise = await prismaTest.expertise.update({
				where: { id: user.profile.expertises![0]!.id },
				data: { level: "Débutant" },
			});
			expect(expertise.level).toBe("Débutant");
		});

		// 3-2: tester la mise à jour partielle du title
		it("should update only provided fields of title", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});

			await prismaTest.expertise.update({
				where: { id: user.profile.expertises![0]!.id },
				data: { title: "Vue" },
			});

			const updated = await prismaTest.expertise.findUnique({
				where: { id: user.profile.expertises![0]!.id },
			});

			expect(updated!.title).toBe("Vue");
			expect(updated!.level).toBe("Expert");
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas duplicate le title lors d'un update
		it("should not allow updating to duplicate title in same profile", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
					{
						title: "Vue",
						level: "Débutant",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.expertise.update({
					where: { id: user.profile.expertises![1]!.id },
					data: { title: "React" },
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas avoir de duplicate order au update
		it("should not allow updating to duplicate order", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
					{
						title: "Vue",
						level: "Débutant",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.expertise.update({
					where: { id: user.profile.expertises![1]!.id },
					data: { order: 1 },
				}),
			).rejects.toThrow();
		});

		// 4-3: ne peut pas mettre une valeur invalide dans level
		it("should not allow updating to invalid level", async () => {
			const user = await createTestUserWithProfile({
				expertises: [{ title: "React", level: "Expert", order: 1 }],
			});

			await expect(
				prismaTest.expertise.update({
					where: { id: user.profile.expertises![0]!.id },
					// @ts-expect-error
					data: { level: "MegaExpert" },
				}),
			).rejects.toThrow();
		});
	});

	//! 5-DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer une expertise
		it("should delete an expertise", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});
			const before = await prismaTest.expertise.findMany({
				where: { profileId: user.profile.id },
			});
			expect(before!.length).toBe(1);
			await prismaTest.expertise.delete({
				where: { id: user.profile.expertises![0]!.id },
			});
			const expertises = await prismaTest.expertise.findMany({
				where: { profileId: user.profile.id },
			});
			expect(expertises!.length).toBe(0);
		});

		// 5-2: supprime les expertises quand le profile est supprimé
		it("should delete the expertises when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});
			expect(user.profile.expertises!.length).toBe(1);
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const expertises = await prismaTest.expertise.findMany({
				where: { profileId: user.profile.id },
			});
			expect(expertises!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: garde le bon ordre des expertise
		it("should keep the correct order of expertises", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
					{
						title: "Vue",
						level: "Débutant",
						order: 2,
					},
				],
			});
			const expertises = await prismaTest.expertise.findMany({
				where: { profileId: user.profile.id },
				orderBy: { order: "asc" },
			});
			expect(expertises[0]!.order).toBe(1);
			expect(expertises[1]!.order).toBe(2);
		});

		// 6-2: vérifie que la expertise est lié au bon profile
		it("should link expertise to the correct profile", async () => {
			const user = await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});

			const expertise = await prismaTest.expertise.findUnique({
				where: { id: user.profile.expertises![0]!.id },
			});

			expect(expertise!.profileId).toBe(user.profile.id);
		});

		// 6-3: 2 profile peuvent avoir le même order
		it("should allow same order for different profiles", async () => {
			await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});

			await createTestUserWithProfile({
				expertises: [
					{
						title: "React",
						level: "Expert",
						order: 1,
					},
				],
			});

			const expertises = await prismaTest.expertise.findMany();
			expect(expertises.length).toBe(2);
		});
	});
});
