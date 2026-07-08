import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Publication model", () => {
	//? 21 tests pour le model Publication => 21 tests ok
	// model Publication {
	//   id          String @id @default(cuid())
	//   title       String
	//   description String?
	//   journalName String?
	//   start       DateTime
	//   end         DateTime?
	//   url         String?

	//   order       Int @default(0)
	//   profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId   String

	//   @@unique([profileId, title])
	//   @@unique([profileId, order]) // pas de doublon dans un profile
	//   @@index([profileId])
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des publications
		it("should create a profile with publications", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});
			const publication = user.profile!.publications![0]!;
			expect(publication.title).toBe("Publication 1");
			expect(publication.journalName).toBe("Journal 1");
			expect(publication.description).toBe("Description 1");
			expect(publication.url).toBe("url 1");
			expect(publication.order).toBe(1);
		});

		// 1-2: peut créer une publication sans description si optional
		it("should create publication without description if optional", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						//   description: 'Description 1',
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});

			const publication = user.profile.publications![0];
			expect(publication!.description).toBeNull();
		});

		// 1-3: peut créer une publication sans journal si optional
		it("should create publication without journal if optional", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						//   journalName: 'Journal 1',
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});

			const publication = user.profile.publications![0];
			expect(publication!.journalName).toBeNull();
		});

		// 1-4: peut créer une publication sans end si optional
		it("should create publication without end if optional", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						//   end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});

			const publication = user.profile.publications![0];
			expect(publication!.end).toBeNull();
		});

		// 1-5: peut créer une publication sans url si optional
		it("should create publication without url if optional", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						//   url: 'url 1',
						order: 1,
					},
				],
			});

			const publication = user.profile.publications![0];
			expect(publication!.url).toBeNull();
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un publication sans un profile
		it("should not create an publication without a profile", async () => {
			await expect(
				prismaTest.publication.create({
					data: {
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer une publication sans un title
		it("should not create an publication without a title", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.publication.create({
					// @ts-expect-error - title is required
					data: {
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		//! A voir si start doit être obligatoire
		// 2-3: ne peut pas créer une publication sans date de début
		it("should not create publication without start date", async () => {
			const user = await createTestUserWithProfile();

			await expect(
				prismaTest.publication.create({
					// @ts-expect-error
					data: {
						title: "Publication 1",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer un publication avec un order déjà existant
		it("should not allow duplicate order for same profile", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.publication.create({
					data: {
						title: "Publication 2",
						journalName: "Journal 2",
						description: "Description 2",
						start: new Date(),
						end: new Date(),
						url: "url 2",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-5: ne peut pas créer 2 publications avec le même nom dans un profile
		it("should not allow duplicate publication title for the same profile", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.publication.create({
					data: {
						title: "Publication 1",
						journalName: "Journal 2",
						description: "Description 2",
						start: new Date(),
						end: new Date(),
						url: "url 2",
						order: 2,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-6: ne peut pas créer une publication avec une date de fin avant la date de début
		// it('should not allow end date before start date', async () => {
		//   const user = await createTestUserWithProfile();

		//   await expect(
		//     prismaTest.publication.create({
		//       data: {
		//         title: 'Publication invalid',
		//         start: new Date('2024-01-01'),
		//         end: new Date('2023-01-01'),
		//         order: 1,
		//         profile: { connect: { id: user.profile.id } },
		//       },
		//     }),
		//   ).rejects.toThrow();
		// });
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour un publication
		it("should update a publication", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});
			const publication = await prismaTest.publication.update({
				where: { id: user.profile.publications![0]!.id },
				data: { title: "Publication 2" },
			});
			expect(publication.title).toBe("Publication 2");
		});

		// 3-2: tester la mise à jour partielle d'une publication
		it("should update only provided fields", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});

			await prismaTest.publication.update({
				where: { id: user.profile.publications![0]!.id },
				data: { journalName: "La dépêche" },
			});

			const updated = await prismaTest.publication.findUnique({
				where: { id: user.profile.publications![0]!.id },
			});

			expect(updated!.title).toBe("Publication 1");
			expect(updated!.journalName).toBe("La dépêche");
		});

		// 3-3: peut mettre à jour un champ optionnel à null
		it("should allow setting optional fields to null", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal",
						start: new Date(),
						order: 1,
					},
				],
			});

			const pub = user.profile.publications![0];

			const updated = await prismaTest.publication.update({
				where: { id: pub!.id },
				data: { journalName: null },
			});

			expect(updated.journalName).toBeNull();
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas duplicate le titre lors d'un update
		it("should not allow updating to duplicate title in same profile", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{ title: "A", start: new Date(), order: 1 },
					{ title: "B", start: new Date(), order: 2 },
				],
			});

			await expect(
				prismaTest.publication.update({
					where: { id: user.profile.publications![1]!.id },
					data: { title: "A" },
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas duplicate le order lors d'un update
		it("should not allow updating to duplicate order in same profile", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{ title: "A", start: new Date(), order: 1 },
					{ title: "B", start: new Date(), order: 2 },
				],
			});

			await expect(
				prismaTest.publication.update({
					where: { id: user.profile.publications![1]!.id },
					data: { order: 1 },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer un publication
		it("should delete an publication", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});
			const before = await prismaTest.publication.findMany({
				where: { profileId: user.profile.id },
			});
			expect(before!.length).toBe(1);
			await prismaTest.publication.delete({
				where: { id: user.profile.publications![0]!.id },
			});
			const publications = await prismaTest.publication.findMany({
				where: { profileId: user.profile.id },
			});
			expect(publications!.length).toBe(0);
		});

		// 5-2: supprime les publications quand le profile est supprimé
		it("should delete the publications when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});
			expect(user.profile.publications!.length).toBe(1);
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const publications = await prismaTest.publication.findMany({
				where: { profileId: user.profile.id },
			});
			expect(publications!.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: garde le bon ordre des publication
		it("should keep the correct order of publications", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
					{
						title: "Publication 2",
						journalName: "Journal 2",
						description: "Description 2",
						start: new Date(),
						end: new Date(),
						url: "url 2",
						order: 2,
					},
				],
			});
			const publications = await prismaTest.publication.findMany({
				where: { profileId: user.profile.id },
				orderBy: { order: "asc" },
			});
			expect(publications[0]!.order).toBe(1);
			expect(publications[1]!.order).toBe(2);
		});

		// 6-2: vérifie que le publication est lié au bon profile
		it("should link publication to the correct profile", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});

			const publication = await prismaTest.publication.findUnique({
				where: { id: user.profile.publications![0]!.id },
			});

			expect(publication!.profileId).toBe(user.profile.id);
		});

		// 6-3: 2 profile peuvent avoir le même order
		it("should allow same order for different profiles", async () => {
			const user1 = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 1",
						journalName: "Journal 1",
						description: "Description 1",
						start: new Date(),
						end: new Date(),
						url: "url 1",
						order: 1,
					},
				],
			});

			const user2 = await createTestUserWithProfile({
				publications: [
					{
						title: "Publication 2",
						journalName: "Journal 2",
						description: "Description 2",
						start: new Date(),
						end: new Date(),
						url: "url 2",
						order: 1,
					},
				],
			});

			const publications = await prismaTest.publication.findMany();
			expect(publications.length).toBe(2);
		});

		// 6-4: order est 0 par défaut
		it("should set default order to 0 if not provided", async () => {
			const user = await createTestUserWithProfile({
				publications: [
					// @ts-expect-error - order is required
					{
						title: "Publication 1",
						start: new Date(),
					},
				],
			});

			const publication = user.profile.publications![0];
			expect(publication!.order).toBe(0);
		});
	});
});
