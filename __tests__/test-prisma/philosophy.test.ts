import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Philosophy model", () => {
	//? 12 tests pour le model Philosophy => 12 tests ok
	// model Philosophy {
	//   id          String @id @default(cuid())
	//   citation    String
	//   author      String?

	//   profile     Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId   String @unique
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec une philosophie
		it("should create a profile with phylosophy", async () => {
			const user = await createTestUserWithProfile({
				philosophy: {
					citation: "Ce que je sais c'est que je ne sais rien",
					author: "Platon",
				},
			});
			const philosophy = user.profile!.philosophy!;
			expect(philosophy.citation).toBe(
				"Ce que je sais c'est que je ne sais rien",
			);
			expect(philosophy.author).toBe("Platon");
		});

		// 1-2 peut créer une philosophie sans un auteur
		it("should create an philosophy without a author", async () => {
			const user = await createTestUserWithProfile({
				philosophy: {
					citation: "Ce que je sais c'est que je ne sais rien",
				},
			});
			const philosophy = user.profile.philosophy!;
			expect(philosophy!.author).toBeNull();
		});

		// 1-3: author est null par défaut si non fourni
		it("should default author to null if not provided", async () => {
			const user = await createTestUserWithProfile({
				philosophy: { citation: "Veni, vidi, vici" },
			});

			const philosophy = user.profile.philosophy!;
			expect(philosophy.author).toBeNull();
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer une philosophie sans un profile
		it("should not create an philosophy without a profile", async () => {
			await expect(
				prismaTest.philosophy.create({
					data: {
						citation: "Ce que je sais c'est que je ne sais rien",
						author: "Platon",
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer une philosophie sans une citation
		it("should not create an philosophy without a citation", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.philosophy.create({
					// @ts-expect-error
					data: {
						author: "Platon",
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour la philosophie
		it("should update a philosophy", async () => {
			const user = await createTestUserWithProfile({
				philosophy: {
					citation: "Ce que je sais c'est que je ne sais rien",
					author: "Platon",
				},
			});
			const philosophy = await prismaTest.philosophy.update({
				where: { id: user.profile.philosophy!.id },
				data: { citation: "Je ne sais qu'une chose c'est que je ne sais rien" },
			});
			expect(philosophy.citation).toBe(
				"Je ne sais qu'une chose c'est que je ne sais rien",
			);
		});

		// 3-2: peut mettre à jour uniquement l'auteur sans affecter la citation
		it("should update only author without affecting citation", async () => {
			const user = await createTestUserWithProfile({
				philosophy: { citation: "Je pense donc je suis", author: "Descartes" },
			});

			await prismaTest.philosophy.update({
				where: { id: user.profile.philosophy!.id },
				data: { author: "Voltaire" },
			});

			const updated = await prismaTest.philosophy.findUnique({
				where: { id: user.profile.philosophy!.id },
			});

			expect(updated!.citation).toBe("Je pense donc je suis");
			expect(updated!.author).toBe("Voltaire");
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas supprimer la citation lors d'un update
		it("should not allow removing citation on update", async () => {
			const user = await createTestUserWithProfile({
				philosophy: { citation: "Cogito ergo sum", author: "Descartes" },
			});

			await expect(
				prismaTest.philosophy.update({
					where: { id: user.profile.philosophy!.id },
					// @ts-expect-error
					data: { citation: null },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer une philosophie
		it("should delete an philosophy", async () => {
			const user = await createTestUserWithProfile({
				philosophy: {
					citation: "Ce que je sais c'est que je ne sais rien",
					author: "Platon",
				},
			});
			const before = await prismaTest.philosophy.findMany({
				where: { profileId: user.profile.id },
			});
			expect(before!.length).toBe(1);
			await prismaTest.philosophy.delete({
				where: { id: user.profile.philosophy!.id },
			});
			const philosophys = await prismaTest.philosophy.findMany({
				where: { profileId: user.profile.id },
			});
			expect(philosophys!.length).toBe(0);
		});

		// 5-2: supprime la philosophie quand le profile est supprimé
		it("should delete the philosophy when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				philosophy: {
					citation: "Ce que je sais c'est que je ne sais rien",
					author: "Platon",
				},
			});
			expect(user.profile.philosophy!.author).toBe("Platon");
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const philosophy = await prismaTest.socialMedia.findMany({
				where: { profileId: user.profile.id },
			});
			expect(philosophy!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: vérifie que la philosophie est lié au bon profile
		it("should link philosophy to the correct profile", async () => {
			const user = await createTestUserWithProfile({
				philosophy: {
					citation: "Ce que je sais c'est que je ne sais rien",
					author: "Platon",
				},
			});

			const philosophy = await prismaTest.philosophy.findUnique({
				where: { id: user.profile.philosophy!.id },
			});

			expect(philosophy!.profileId).toBe(user.profile.id);
		});

		// 6-2: 2 profile peuvent avoir la même philosophie
		it("should allow same order for different profiles", async () => {
			const user1 = await createTestUserWithProfile({
				philosophy: {
					citation: "Ce que je sais c'est que je ne sais rien",
					author: "Platon",
				},
			});

			const user2 = await createTestUserWithProfile({
				philosophy: {
					citation: "Ce que je sais c'est que je ne sais rien",
					author: "Platon",
				},
			});

			const philosophy = await prismaTest.philosophy.findMany();
			expect(philosophy.length).toBe(2);
		});
	});
});
