import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Certification model", () => {
	//? 16 tests pour le model Certification => 16 tests ok
	// model Certification {
	//   id          String @id @default(cuid())
	//   title       String
	//   organismeCertification String?

	//   order       Int @default(0)
	//   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId   String

	//   @@unique([profileId, title])
	//   @@unique([profileId, order])
	//   @@index([profileId])
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des certifications
		it("should create a profile with certifications", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});
			const certification = user.profile!.certifications![0]!;
			expect(certification.title).toBe("Certif 1");
			expect(certification.organismeCertification).toBe("Organisme 1");
			expect(certification.order).toBe(1);
		});

		// 1-2: peut créer une certification sans organismeCertification si optional
		it("should create certification without organismeCertification if optional", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						order: 1,
					},
				],
			});

			const certification = user.profile.certifications![0];
			expect(certification!.organismeCertification).toBeNull();
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un certification sans un profile
		it("should not create an certification without a profile", async () => {
			await expect(
				prismaTest.certification.create({
					data: {
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer une certification sans un title
		it("should not create an certification without a title", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.certification.create({
					// @ts-expect-error - title is required
					data: {
						organismeCertification: "Organisme 1",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer un certification avec un order déjà existant
		it("should not allow duplicate order for same profile", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.certification.create({
					data: {
						title: "Certif 2",
						organismeCertification: "Organisme 2",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer 2 certifications avec le même title dans un profile
		it("should not allow duplicate certification title for the same profile", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.certification.create({
					data: {
						title: "Certif 1",
						organismeCertification: "Organisme 2",
						order: 2,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour un certification avec un organismeCertification
		it("should update a certification with an organismeCertification", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});
			const certification = await prismaTest.certification.update({
				where: { id: user.profile.certifications![0]!.id },
				data: { organismeCertification: "Organisme 2" },
			});
			expect(certification.organismeCertification).toBe("Organisme 2");
		});

		// 3-2: tester la mise à jour partielle du title
		it("should update only provided fields of title", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});

			await prismaTest.certification.update({
				where: { id: user.profile.certifications![0]!.id },
				data: { title: "Certif 2" },
			});

			const updated = await prismaTest.certification.findUnique({
				where: { id: user.profile.certifications![0]!.id },
			});

			expect(updated!.title).toBe("Certif 2");
			expect(updated!.organismeCertification).toBe("Organisme 1");
		});

		// 3-3: peut mettre l'organismeCertification à null si optional
		it("should allow setting organismeCertification to null", async () => {
			const user = await createTestUserWithProfile({
				certifications: [{ title: "Certif 1", organismeCertification: "Org 1", order: 1 }],
			});

			await prismaTest.certification.update({
				where: { id: user.profile.certifications![0]!.id },
				data: { organismeCertification: null },
			});

			const updated = await prismaTest.certification.findUnique({
				where: { id: user.profile.certifications![0]!.id },
			});

			expect(updated!.organismeCertification).toBeNull();
			expect(updated!.title).toBe("Certif 1");
			expect(updated!.order).toBe(1);
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas duplicate le title lors d'un update
		it("should not allow updating to duplicate title in same profile", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
					{
						title: "Certif 2",
						organismeCertification: "Organisme 2",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.certification.update({
					where: { id: user.profile.certifications![1]!.id },
					data: { title: "Certif 1" },
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas avoir de duplicate order au update
		it("should not allow updating to duplicate order", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
					{
						title: "Certif 2",
						organismeCertification: "Organisme 2",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.certification.update({
					where: { id: user.profile.certifications![1]!.id },
					data: { order: 1 },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer un certification
		it("should delete an certification", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});
			const before = await prismaTest.certification.findMany({
				where: { profileId: user.profile.id },
			});
			expect(before!.length).toBe(1);
			await prismaTest.certification.delete({
				where: { id: user.profile.certifications![0]!.id },
			});
			const certifications = await prismaTest.certification.findMany({
				where: { profileId: user.profile.id },
			});
			expect(certifications!.length).toBe(0);
		});

		// 5-2: supprime les certification quand le profile est supprimé
		it("should delete the certifications when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});
			expect(user.profile.certifications!.length).toBe(1);
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const certifications = await prismaTest.certification.findMany({
				where: { profileId: user.profile.id },
			});
			expect(certifications!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: garde le bon ordre des certifications
		it("should keep the correct order of certifications", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
					{
						title: "Certif 2",
						organismeCertification: "Organisme 2",
						order: 2,
					},
				],
			});
			const certifications = await prismaTest.certification.findMany({
				where: { profileId: user.profile.id },
				orderBy: { order: "asc" },
			});
			expect(certifications[0]!.order).toBe(1);
			expect(certifications[1]!.order).toBe(2);
		});

		// 6-2: vérifie que la certification est lié au bon profile
		it("should link certification to the correct profile", async () => {
			const user = await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});

			const certification = await prismaTest.certification.findUnique({
				where: { id: user.profile.certifications![0]!.id },
			});

			expect(certification!.profileId).toBe(user.profile.id);
		});

		// 6-3: 2 profile peuvent avoir le même order
		it("should allow same order for different profiles", async () => {
			await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});

			await createTestUserWithProfile({
				certifications: [
					{
						title: "Certif 1",
						organismeCertification: "Organisme 1",
						order: 1,
					},
				],
			});

			const certifications = await prismaTest.certification.findMany();
			expect(certifications.length).toBe(2);
		});
	});
});
