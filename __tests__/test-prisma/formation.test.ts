import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Formation model", () => {
	//? 20 tests pour le model Formation => 20 tests ok
	// model Formation {
	//   id          String @id @default(cuid())
	//   title       String
	//   organismeFormation String?
	//   start       DateTime
	//   end         DateTime?

	//   order       Int @default(0)
	//   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId   String

	//   @@unique([profileId, title])
	//   @@unique([profileId, order]) // pas de doublon dans un profile
	//   @@index([profileId])
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des formations
		it("should create a profile with formations", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});
			const formation = user.profile!.formations![0]!;
			expect(formation.title).toBe("Forma 1");
			expect(formation.organismeFormation).toBe("Organisme 1");
			expect(formation.order).toBe(1);
		});

		// 1-2: peut créer une formation sans organismeFormation si optional
		it("should create formation without organismeFormation if optional", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});

			const formation = user.profile.formations![0];
			expect(formation!.organismeFormation).toBeNull();
		});

		// 1-3: peut créer une formation sans end si optional
		it("should create formation without end if optional", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						// end: new Date(),
						order: 1,
					},
				],
			});

			const formation = user.profile.formations![0];
			expect(formation!.end).toBeNull();
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un formation sans un profile
		it("should not create an formation without a profile", async () => {
			await expect(
				prismaTest.formation.create({
					data: {
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer une formation sans un title
		it("should not create an formation without a title", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.formation.create({
					// @ts-expect-error - title is required
					data: {
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer une formation sans un start
		it("should not create an formation without a start", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.formation.create({
					// @ts-expect-error - title is required
					data: {
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						// start: new Date(),
						end: new Date(),
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer une formation sans un order
		it("should not create an formation without a order", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.formation.create({
					// @ts-expect-error - order is required
					data: {
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						// start: new Date(),
						end: new Date(),
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-5: ne peut pas créer un formation avec un order déjà existant
		it("should not allow duplicate order for same profile", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.formation.create({
					data: {
						title: "Forma 2",
						organismeFormation: "Organisme 2",
						start: new Date(),
						end: new Date(),
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-6: ne peut pas créer 2 formations avec le même title dans un profile
		it("should not allow duplicate formation title for the same profile", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.formation.create({
					data: {
						title: "Forma 1",
						organismeFormation: "Organisme 2",
						start: new Date(),
						end: new Date(),
						order: 2,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour un formation avec un organismeFormation
		it("should update a formation with an organismeFormation", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});
			const formation = await prismaTest.formation.update({
				where: { id: user.profile.formations![0]!.id },
				data: { organismeFormation: "Organisme 2" },
			});
			expect(formation.organismeFormation).toBe("Organisme 2");
		});

		// 3-2: tester la mise à jour partielle du title
		it("should update only provided fields of title", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});

			await prismaTest.formation.update({
				where: { id: user.profile.formations![0]!.id },
				data: { title: "Forma 2" },
			});

			const updated = await prismaTest.formation.findUnique({
				where: { id: user.profile.formations![0]!.id },
			});

			expect(updated!.title).toBe("Forma 2");
			expect(updated!.organismeFormation).toBe("Organisme 1");
		});

		// 3-3: peut mettre l'organismeFormation et l'end à null si optional
		it("should allow setting organismeFormation and end to null", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Org 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});

			await prismaTest.formation.update({
				where: { id: user.profile.formations![0]!.id },
				data: { organismeFormation: null, end: null },
			});

			const updated = await prismaTest.formation.findUnique({
				where: { id: user.profile.formations![0]!.id },
			});

			expect(updated!.organismeFormation).toBeNull();
			expect(updated!.end).toBeNull();
			expect(updated!.title).toBe("Forma 1");
			expect(updated!.order).toBe(1);
		});
	});

	//! 4- UPDATE ERROR TESTS => contraintes uniques
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas duplicate le title lors d'un update
		it("should not allow updating to duplicate title in same profile", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
					{
						title: "Forma 2",
						organismeFormation: "Organisme 2",
						start: new Date(),
						end: new Date(),
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.formation.update({
					where: { id: user.profile.formations![1]!.id },
					data: { title: "Forma 1" },
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas avoir de duplicate order au update
		it("should not allow updating to duplicate order", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
					{
						title: "Forma 2",
						organismeFormation: "Organisme 2",
						start: new Date(),
						end: new Date(),
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.formation.update({
					where: { id: user.profile.formations![1]!.id },
					data: { order: 1 },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer un formation
		it("should delete an formation", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Certif 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});
			const before = await prismaTest.formation.findMany({
				where: { profileId: user.profile.id },
			});
			expect(before!.length).toBe(1);
			await prismaTest.formation.delete({
				where: { id: user.profile.formations![0]!.id },
			});
			const formations = await prismaTest.formation.findMany({
				where: { profileId: user.profile.id },
			});
			expect(formations!.length).toBe(0);
		});

		// 5-2: supprime les formation quand le profile est supprimé
		it("should delete the formations when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Certif 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});
			expect(user.profile.formations!.length).toBe(1);
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const formations = await prismaTest.formation.findMany({
				where: { profileId: user.profile.id },
			});
			expect(formations!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 5-1: garde le bon ordre des formations
		it("should keep the correct order of formations", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
					{
						title: "Forma 2",
						organismeFormation: "Organisme 2",
						start: new Date(),
						end: new Date(),
						order: 2,
					},
				],
			});
			const formations = await prismaTest.formation.findMany({
				where: { profileId: user.profile.id },
				orderBy: { order: "asc" },
			});
			expect(formations[0]!.order).toBe(1);
			expect(formations[1]!.order).toBe(2);
		});

		// 5-2: vérifie que la formation est lié au bon profile
		it("should link formation to the correct profile", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});

			const formation = await prismaTest.formation.findUnique({
				where: { id: user.profile.formations![0]!.id },
			});

			expect(formation!.profileId).toBe(user.profile.id);
		});

		// 5-3: 2 profile peuvent avoir le même order, title et organismeFormation
		it("should allow same order, title and organismeFormation for different profiles", async () => {
			await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});

			await createTestUserWithProfile({
				formations: [
					{
						title: "Forma 1",
						organismeFormation: "Organisme 1",
						start: new Date(),
						end: new Date(),
						order: 1,
					},
				],
			});

			const formations = await prismaTest.formation.findMany();
			expect(formations.length).toBe(2);
		});

		// 5-4: order est 0 par défaut
		it("should set order to 0 by default", async () => {
			const user = await createTestUserWithProfile({
				formations: [
					// @ts-expect-error - order is required
					{ title: "Forma 1", start: new Date() },
				],
			});

			const formation = await prismaTest.formation.findFirst({
				where: { profileId: user.profile.id },
			});

			expect(formation!.order).toBe(0);
		});
	});
});
