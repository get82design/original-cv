import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";

describe("Profile model", () => {
	//? 12 tests pour le model Profile => 12 tests ok
	// model Profile {
	//   id          String @id @default(cuid())
	//   userId      String @unique                // un profile par user
	//   firstName   String
	//   lastName    String
	//   phone       String?
	//   location    String?

	//   user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
	//   description Description?
	//   skills      ProfileSkillGroup[]                           // 1:N
	//   experiences Experience[]
	//   educations  Education[]
	//   achievements Achievement[]
	//   strengths Strength[]
	//   volunteerings Volunteering[]
	//   projects Project[]
	//   publications Publication[]
	//   languages Language[]
	//   passions Passion[]
	//   socialMedias SocialMedia[]
	//   philosophy Philosophy?
	//   expertises Expertise[]
	//   prices Price[]
	//   certifications Certification[]
	//   formations Formation[]
	//   competences ProfileCompetenceGroup[]
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un user avec un profile simple
		it("should create a profile if user is created (1:1)", async () => {
			// Créer un user
			const user = await createTestUser();

			// Puis créer un profile et l'associer
			const profile = await prismaTest.profile.create({
				data: {
					firstName: "Bob",
					lastName: "Test",
					user: { connect: { id: user.id } },
				},
				include: { user: true },
			});

			const refreshedUser = await prismaTest.user.findUnique({
				where: { id: user.id },
				include: { profile: true },
			});

			expect(profile.user.id).toBe(user.id);
			expect(profile.user.email).toBe(user.email);
			expect(refreshedUser?.profile?.firstName).toBe("Bob");
		});

		// 1-2: peut créer un profile avec phone et location optionnels
		it("should allow optional phone and location", async () => {
			const user = await createTestUser();
			const profile = await prismaTest.profile.create({
				data: {
					firstName: "Test",
					lastName: "User",
					phone: "1234567890",
					location: "Paris",
					user: { connect: { id: user.id } },
				},
			});
			expect(profile.phone).toBe("1234567890");
			expect(profile.location).toBe("Paris");
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un profile sans firstName
		it("should not create a profile without firstName", async () => {
			const user = await createTestUser();

			await expect(
				prismaTest.profile.create({
					// @ts-expect-error test volontaire
					data: {
						lastName: "Test",
						user: { connect: { id: user.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer un profile sans user
		it("should not create a profile without user", async () => {
			await expect(
				prismaTest.profile.create({
					data: {
						firstName: "Bob",
						lastName: "Test",
						user: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer un profile avec un user qui n'existe pas
		it("should not create a profile with a user that does not exist", async () => {
			await expect(
				prismaTest.profile.create({
					data: {
						firstName: "Bob",
						lastName: "Test",
						user: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer un user avec deux profiles
		it("should not allow two profiles for the same user", async () => {
			const user = await prismaTest.user.create({
				data: { name: "Eve", email: "eve@test.com", password: "123" },
			});

			await prismaTest.profile.create({
				data: { firstName: "Eve", lastName: "Adams", userId: user.id },
			});

			await expect(
				prismaTest.profile.create({
					data: { firstName: "Eve2", lastName: "Adams2", userId: user.id },
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut modifier le firstName et le lastName du profile
		it("should update the firstName and lastName of the profile", async () => {
			const user = await createTestUserWithProfile();
			const updatedProfile = await prismaTest.profile.update({
				where: { id: user.profile.id },
				data: { firstName: "John", lastName: "Doe" },
			});
			expect(updatedProfile.firstName).toBe("John");
			expect(updatedProfile.lastName).toBe("Doe");
		});
	});

	//! 4- UPDATE ERROR
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas mettre à jour le profile pour qu’il pointe vers un user déjà existant (violates unique userId)
		it("should not allow updating profile to a user that already has a profile", async () => {
			const user1 = await createTestUserWithProfile();
			const user2 = await createTestUserWithProfile();

			await expect(
				prismaTest.profile.update({
					where: { id: user2.profile.id },
					data: { userId: user1.id },
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas mettre à jour firstName ou lastName avec une valeur vide
		it("should not allow updating firstName or lastName to empty", async () => {
			const user = await createTestUserWithProfile();

			await expect(
				prismaTest.profile.update({
					where: { id: user.profile.id },
					// @ts-expect-error test volontaire
					data: { firstName: null },
				}),
			).rejects.toThrow();

			await expect(
				prismaTest.profile.update({
					where: { id: user.profile.id },
					// @ts-expect-error test volontaire
					data: { lastName: null },
				}),
			).rejects.toThrow();
		});

		// 4-3: ne peut pas dissocier le profile du user (userId obligatoire)
		it("should not allow setting userId to null", async () => {
			const user = await createTestUserWithProfile();

			await expect(
				prismaTest.profile.update({
					where: { id: user.profile.id },
					data: { userId: "" },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer un profile
		it("should delete a profile", async () => {
			const user = await createTestUserWithProfile();

			await prismaTest.profile.delete({
				where: { id: user.profile.id },
			});

			const profile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
			});

			expect(profile).toBeNull();
		});

		// 5-2: peut supprimer un user avec un profile
		it("should delete the profile when the user is deleted", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "Dana",
					email: "dana@test.com",
					password: "123",
					profile: { create: { firstName: "Dana", lastName: "Smith" } },
				},
			});

			await prismaTest.user.delete({ where: { id: user.id } });

			const profile = await prismaTest.profile.findUnique({
				where: { userId: user.id },
			});
			expect(profile).toBeNull();
		});
	});

	//! 6- RELATIONS TESTS
	// describe('RELATIONS', () => {});
});
