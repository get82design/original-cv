import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUserWithCvs } from "../utils/create-test-user-with-cvs";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { PlanRole } from "../../generated/prisma/enums";

describe("User model", () => {
	//? 18 tests pour le model User => 18 tests ok
	// model User {
	//   id            String    @id @default(cuid())
	//   email         String    @unique      // email unique
	//   name          String
	//   password      String                      // mot de passe hashé
	//   emailVerified DateTime?
	//   image         String?

	//   accounts      Account[]                   // NextAuth relation
	//   sessions      Session[]
	//   profile       Profile?                    // relation 1:1 avec le profil détaillé
	//   cvs           CV[]                        // relation 1:N avec les CVs
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un user sans profile
		it("should create a simple user", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "Marc",
					email: "marc@test.com", // TODO: use generateTestEmail()
					password: "secret",
				},
			});

			expect(user.id).toBeDefined();
			expect(user.name).toBe("Marc");
			expect(user.email).toBe("marc@test.com");
		});

		// 1-2: peut créer un user avec tous les champs
		it("should create a simple user with all fields", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "Marc",
					email: "marc@test.com",
					password: "secret",
					emailVerified: new Date(),
					image: "https://example.com/image.jpg",
				},
			});

			expect(user.id).toBeDefined();
			expect(user.name).toBe("Marc");
			expect(user.email).toBe("marc@test.com");
			expect(user.emailVerified).toBeInstanceOf(Date);
			expect(user.image).toBe("https://example.com/image.jpg");
			expect(user.plan).toBe(PlanRole.FREE);
			expect(user.downloadCredits).toBe(0);
			expect(user.freeDownloadsRemaining).toBe(0);
			expect(user.maxCvs).toBe(1);
			expect(user.iaRequestsUsed).toBe(0);
			expect(user.isActive).toBe(true);
			expect(user.createdAt).toBeInstanceOf(Date);
			expect(user.updatedAt).toBeInstanceOf(Date);
			expect(user.lastIaReset).toBeInstanceOf(Date);
		});

		// 1-3: peut créer un user avec un profile
		it("should create a user with a profile", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "Charlie",
					email: "charlie@test.com",
					password: "123",
					profile: {
						create: { firstName: "Charlie", lastName: "Brown" },
					},
				},
				include: { profile: true },
			});

			expect(user.profile).toBeDefined();
			expect(user.profile?.firstName).toBe("Charlie");
		});

		// 1-4: peut créer un user avec des CVs
		it("should create user with multiple cvs", async () => {
			const user = await createTestUserWithCvs({
				cvs: [
					{ title: "CV Dev", templateId: "template-1" },
					{ title: "CV Manager", templateId: "template-2" },
				],
			});

			expect(user.cvs.length).toBe(2);
			expect(user.cvs[0]!.title).toBe("CV Dev");
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un user sans email
		it("should reject creation without email", async () => {
			await expect(
				// on veut volontairement passer un objet invalide pour tester l’erreur
				// @ts-expect-error
				prismaTest.user.create({ data: { name: "NoEmail", password: "123" } }),
			).rejects.toThrow();
		});

		// // 2-2: ne peut pas créer un user sans password
		// it("should reject creation without password", async () => { //! Plus d'actualité
		// 	await expect(
		// 		prismaTest.user.create({
		// 			data: { name: "NoPassword", email: "nopass@test.com" },
		// 		}),
		// 	).rejects.toThrow();
		// });

		// // 2-3: ne peut pas créer un user sans name
		// it("should reject creation without name", async () => { //! Plus d'actualité
		// 	await expect(
		// 		prismaTest.user.create({
		// 			data: { password: "NoPassword", email: "nopass@test.com" },
		// 		}),
		// 	).rejects.toThrow();
		// });

		// 2-4: ne peut pas créer un user avec un email déjà existant
		it("should reject duplicate emails", async () => {
			await prismaTest.user.create({
				data: { name: "Bob", email: "bob@test.com", password: "123" },
			});
			await expect(
				prismaTest.user.create({
					data: { name: "Bob2", email: "bob@test.com", password: "456" },
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour le name d'un user
		it("should update user name", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "OldName",
					email: "update@test.com",
					password: "123",
				},
			});

			const updated = await prismaTest.user.update({
				where: { id: user.id },
				data: { name: "NewName" },
			});

			expect(updated.name).toBe("NewName");
		});

		// 3-2: peut mettre à jour seulement les champs fournis
		it("should update only provided fields", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "Test",
					email: "partial@test.com",
					password: "123",
				},
			});

			await prismaTest.user.update({
				where: { id: user.id },
				data: { name: "Updated" },
			});

			const updated = await prismaTest.user.findUnique({
				where: { id: user.id },
			});

			expect(updated).not.toBeNull();
			expect(updated!.email).toBe("partial@test.com");
		});

		// 3-3: peut vérifier un email
		it("should verify email", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "Verify",
					email: "verify@test.com",
					password: "123",
				},
			});

			const updated = await prismaTest.user.update({
				where: { id: user.id },
				data: { emailVerified: new Date() },
			});

			expect(updated.emailVerified).toBeInstanceOf(Date);
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas mettre à jour un email déjà existant
		it("should not allow updating to duplicate email", async () => {
			const user1 = await prismaTest.user.create({
				data: { name: "A", email: "a@test.com", password: "123" },
			});

			const user2 = await prismaTest.user.create({
				data: { name: "B", email: "b@test.com", password: "123" },
			});

			await expect(
				prismaTest.user.update({
					where: { id: user2.id },
					data: { email: "a@test.com" },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer un user
		it("should delete a user", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "Delete",
					email: "delete@test.com",
					password: "123",
				},
			});

			await prismaTest.user.delete({
				where: { id: user.id },
			});

			const deleted = await prismaTest.user.findUnique({
				where: { id: user.id },
			});
			expect(deleted).toBeNull();
		});

		// 5-2: peut supprimer un user avec des CVs
		it("should delete cvs when user is deleted", async () => {
			const user = await createTestUserWithCvs({
				cvs: [
					{ title: "CV Dev", templateId: "template-1" },
					{ title: "CV Manager", templateId: "template-2" },
				],
			});

			expect(user.cvs.length).toBe(2);

			await prismaTest.user.delete({
				where: { id: user.id },
			});

			const cvs = await prismaTest.cV.findMany();
			expect(cvs.length).toBe(0);
		});

		// 5-3: peut supprimer un user avec un profile
		it("should delete profile when user is deleted", async () => {
			const user = await createTestUserWithProfile();

			await prismaTest.user.delete({
				where: { id: user.id },
			});

			const profile = await prismaTest.profile.findUnique({
				where: { userId: user.id },
			});
			expect(profile).toBeNull();
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: ne peut pas créer deux profiles pour le même user
		it("should not allow two profiles for the same user", async () => {
			const user = await prismaTest.user.create({
				data: {
					name: "Test",
					email: "profile@test.com",
					password: "123",
					profile: {
						create: { firstName: "John", lastName: "Doe" },
					},
				},
			});

			await expect(
				prismaTest.profile.create({
					data: {
						firstName: "Jane",
						lastName: "Doe",
						user: { connect: { id: user.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 6-2: peut lier des CVs à un user
		it("should link cvs to correct user", async () => {
			const user = await createTestUserWithCvs({
				cvs: [{ title: "CV1", templateId: "t1" }],
			});

			const cv = await prismaTest.cV.findFirst({
				where: { userId: user.id },
			});

			expect(cv!.userId).toBe(user.id);
		});

		// 6-3: peut lier un profile à un user
		it("should link profile to correct user", async () => {
			const user = await createTestUserWithProfile();

			const profile = await prismaTest.profile.findUnique({
				where: { userId: user.id },
			});

			expect(profile!.userId).toBe(user.id);
		});
	});

	// // ne peut pas créer un user sans un des champs obligatoires
	// describe('User required fields', () => {
	//   it.each([
	//     [{ name: 'Alice', password: 'secret' }, 'email'], // email manquant
	//     [{ email: 'alice@test.com', password: 'secret' }, 'name'], // name manquant
	//     [{ name: 'Alice', email: 'alice@test.com' }, 'password'], // password manquant
	//   ])('should reject creating a user without %s', async (userData, missingField) => {
	//     await expect(prismaTest.user.create({ data: userData })).rejects.toThrow();
	//   });
	// });
});
