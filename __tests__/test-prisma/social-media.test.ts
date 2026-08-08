import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("SocialMedia model", () => {
	//? 18 tests pour le model SocialMedia => 18 tests ok
	// model SocialMedia {
	//   id            String @id @default(cuid())
	//   socialNetwork String
	//   username      String

	//   order         Int @default(0)
	//   profile       Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
	//   profileId     String

	//   @@unique([profileId, socialNetwork])
	//   @@unique([profileId, order]) // pas de doublon dans un profile
	//   @@index([profileId])
	// }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des réseaux sociaux
		it("should create a profile with socialMedias", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});
			const socialMedia = user.profile!.socialMedias![0]!;
			expect(socialMedia.socialNetwork).toBe("facebook");
			expect(socialMedia.username).toBe("username");
			expect(socialMedia.order).toBe(1);
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer une socialMedia sans un profile
		it("should not create an socialMedia without a profile", async () => {
			await expect(
				prismaTest.socialMedia.create({
					data: {
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: peut créer une socialMedia sans un socialNetwork
		it("should create an socialMedia without a socialNetwork", async () => {
			const user = await createTestUserWithProfile();
			const socialMedia = await prismaTest.socialMedia.create({
					data: {
						username: "username",
						icon: "faGlobe",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				})
			
			expect(socialMedia.username).toBe("username");
			expect(socialMedia.icon).toBe("faGlobe");
			expect(socialMedia.order).toBe(1);
			expect(socialMedia.socialNetwork).toBeNull();
		});

		// 2-3: ne peut pas créer une socialMedia sans un username
		it("should not create an socialMedia without a username", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.socialMedia.create({
					// @ts-expect-error - title is required
					data: {
						socialNetwork: "facebook",
						icon: "faGlobe",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer une socialMedia sans un icon
		it("should not create an socialMedia without a icon", async () => {
			const user = await createTestUserWithProfile();
			await expect(
				prismaTest.socialMedia.create({
					// @ts-expect-error - icon is required
					data: {
						socialNetwork: "facebook",
						username: "username",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer un socialMedia avec un order déjà existant
		it("should not allow duplicate order for same profile", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.socialMedia.create({
					data: {
						socialNetwork: "instagram",
						username: "username 2",
						icon: "faGlobe",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-5: ne peut pas créer 2 socialMedias avec le même nom dans un profile
		it("should not allow duplicate socialMedia socialNetwork for the same profile", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});

			await expect(
				prismaTest.socialMedia.create({
					data: {
						socialNetwork: "facebook",
						username: "username 2",
						icon: "faGlobe",
						order: 2,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut mettre à jour une socialMedia avec socialNetwork
		it("should update a socialMedia with socialNetwork", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});
			const socialMedia = await prismaTest.socialMedia.update({
				where: { id: user.profile.socialMedias![0]!.id },
				data: { socialNetwork: "Instagram" },
			});
			expect(socialMedia.socialNetwork).toBe("Instagram");
		});

		// 3-2: tester la mise à jour partielle d'une socialMedia avec username
		it("should update only provided fields with username", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});

			await prismaTest.socialMedia.update({
				where: { id: user.profile.socialMedias![0]!.id },
				data: { username: "username2" },
			});

			const updated = await prismaTest.socialMedia.findUnique({
				where: { id: user.profile.socialMedias![0]!.id },
			});

			expect(updated!.socialNetwork).toBe("facebook");
			expect(updated!.username).toBe("username2");
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas duplicate le name lors d'un update
		it("should not allow updating to duplicate name in same profile", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
					{
						socialNetwork: "instagram",
						username: "username 2",
						icon: "faGlobe",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.socialMedia.update({
					where: { id: user.profile.socialMedias![1]!.id },
					data: { socialNetwork: "facebook" },
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas avoir de duplicate order au update
		it("should not allow updating to duplicate order", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
					{
						socialNetwork: "instagram",
						username: "username 2",
						icon: "faGlobe",
						order: 2,
					},
				],
			});

			await expect(
				prismaTest.socialMedia.update({
					where: { id: user.profile.socialMedias![1]!.id },
					data: { order: 1 },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer une socialMedia
		it("should delete an socialMedia", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});
			const before = await prismaTest.socialMedia.findMany({
				where: { profileId: user.profile.id },
			});
			expect(before!.length).toBe(1);
			await prismaTest.socialMedia.delete({
				where: { id: user.profile.socialMedias![0]!.id },
			});
			const socialMedias = await prismaTest.socialMedia.findMany({
				where: { profileId: user.profile.id },
			});
			expect(socialMedias!.length).toBe(0);
		});

		// 5-2: supprime les socialMedias quand le profile est supprimé
		it("should delete the socialMedias when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});
			expect(user.profile.socialMedias!.length).toBe(1);
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const socialMedias = await prismaTest.socialMedia.findMany({
				where: { profileId: user.profile.id },
			});
			expect(socialMedias!.length).toBe(0);
		});

		// 5-3: supprime les socialMedias quand l'utilisateur est supprimé
		it("should delete socialMedias when user is deleted", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{ socialNetwork: "linkedin", username: "user", icon: "faGlobe", order: 1 },
				],
			});

			await prismaTest.user.delete({ where: { id: user.id } });

			const socialMedias = await prismaTest.socialMedia.findMany({
				where: { profileId: user.profile.id },
			});
			expect(socialMedias.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: garde le bon ordre des socialMedia
		it("should keep the correct order of socialMedias", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
					{
						socialNetwork: "instagram",
						username: "username 2",
						icon: "faGlobe",
						order: 2,
					},
				],
			});
			const socialMedias = await prismaTest.socialMedia.findMany({
				where: { profileId: user.profile.id },
				orderBy: { order: "asc" },
			});
			expect(socialMedias[0]!.order).toBe(1);
			expect(socialMedias[1]!.order).toBe(2);
		});

		// 6-2: vérifie que la socialMedia est lié au bon profile
		it("should link socialMedia to the correct profile", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});

			const socialMedia = await prismaTest.socialMedia.findUnique({
				where: { id: user.profile.socialMedias![0]!.id },
			});

			expect(socialMedia!.profileId).toBe(user.profile.id);
		});

		// 6-3: 2 profile peuvent avoir le même order
		it("should allow same order for different profiles", async () => {
			const user1 = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username",
						icon: "faGlobe",
						order: 1,
					},
				],
			});

			const user2 = await createTestUserWithProfile({
				socialMedias: [
					{
						socialNetwork: "facebook",
						username: "username 2",
						icon: "faGlobe",
						order: 1,
					},
				],
			});

			const socialMedias = await prismaTest.socialMedia.findMany();
			expect(socialMedias.length).toBe(2);
		});

		// 6-4: order est 0 par défaut
		it("should set default order to 0 if not provided", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: [
					// @ts-expect-error - order is required
					{ socialNetwork: "twitter", username: "user", icon: "faGlobe" },
				],
			});

			const socialMedia = user.profile.socialMedias![0]!;
			expect(socialMedia.order).toBe(0);
		});

		// 6-5: retourne les socialMedias dans le bon ordre pour le profile
		it("should return socialMedias in correct order for profile", async () => {
			const user = await createTestUserWithProfile({
				socialMedias: Array.from({ length: 5 }, (_, i) => ({
					socialNetwork: `network${i + 1}`,
					username: `user${i + 1}`,
					icon: "faGlobe",
					order: i + 1,
				})),
			});

			const socialMedias = await prismaTest.socialMedia.findMany({
				where: { profileId: user.profile.id },
				orderBy: { order: "asc" },
			});

			expect(socialMedias.map((s) => s.order)).toEqual([1, 2, 3, 4, 5]);
		});
	});
});
