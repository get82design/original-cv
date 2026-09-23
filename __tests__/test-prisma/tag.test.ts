import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";
import type { Tag, ProfileTag, ProfileTagGroup } from "../../generated/prisma/client";

describe("Tag model", () => {
	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: peut créer un profile avec des tags
		it("should create a profile with tags", async () => {
			const user = await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Langages",
						order: 1,
						tags: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			const tagNames = user
				.profile!.tags! /*as (ProfileTagGroup & {
        tags: (ProfileTag & { tag: Tag })[];
      })[]*/
				.flatMap(
					(
						group: ProfileTagGroup & {
							tags: (ProfileTag & { tag: Tag })[];
						},
					) => group.tags.map((pt: ProfileTag & { tag: Tag }) => pt.tag.name),
				);
			expect(tagNames).toContain("TypeScript");
			expect(user.profile.tags!.length).toBe(1); // 1 groupe
		});

		// 1-2: peut créer deux profiles avec la même tag
		it("should allow two profiles to share the same tag", async () => {
			await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Langages",
						order: 1,
						tags: [{ name: "typescript", order: 1 }],
					},
				],
			});

			await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Frontend",
						order: 1,
						tags: [{ name: "typescript", order: 1 }],
					},
				],
			});

			const tags = await prismaTest.tag.findMany();
			const profileTags = await prismaTest.profileTag.findMany();

			expect(tags.length).toBe(1); // une seule tag globale
			expect(profileTags.length).toBe(2); // deux liens
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un profileTag sans un groupe
		it("should not create a profileTag without a group", async () => {
			await createTestUserWithProfile();

			// Essayer de créer un profileTag sans groupe
			await expect(
				prismaTest.profileTag.create({
					// @ts-expect-error test volontaire
					data: {
						tag: { connect: { name: "TypeScript" } },
						// group: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer un groupe de tags sans un profile
		it("should not create a tag group without profile", async () => {
			await expect(
				prismaTest.profileTagGroup.create({
					data: {
						title: "Langages",
						tags: {
							create: [{ tag: { connect: { name: "TypeScript" } } }],
						},
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer un tag avec un nom déjà existant
		it("should not allow duplicate tag names", async () => {
			await prismaTest.tag.create({
				data: { name: "TypeScript" },
			});

			await expect(
				prismaTest.tag.create({
					data: { name: "TypeScript" },
				}),
			).rejects.toThrow(/Unique constraint failed/);
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: peut rajouter un tag dans un groupe
		it("should add a tag to a group", async () => {
			const user = await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Langages",
						order: 1,
						tags: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			const tagGroups = user.profile!.tags!;
			await prismaTest.profileTag.create({
				data: {
					tag: {
						connectOrCreate: {
							where: { name: "react" },
							create: { name: "react" },
						},
					},
					group: { connect: { id: tagGroups[0]!.id } },
				},
			});
			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
				include: {
					tags: {
						include: { tags: { include: { tag: true } } },
					},
				},
			});
			const allTags = updatedProfile!.tags!.flatMap((group) => group.tags.map((ps) => ps.tag.name));
			expect(allTags).toContain("TypeScript");
			expect(allTags).toContain("react");
			expect(allTags.length).toBe(2);
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas créer un tag avec un nom déjà existant dans le même groupe
		it("should not allow duplicate tag in same group", async () => {
			const user = await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Langages",
						order: 1,
						tags: [{ name: "TypeScript", order: 1 }],
					},
				],
			});

			const group = user.profile!.tags![0]!;

			await expect(
				prismaTest.profileTag.create({
					data: {
						tag: { connect: { name: "TypeScript" } },
						group: { connect: { id: group.id } },
					},
				}),
			).rejects.toThrow();
		});

		// 4-2: ne peut pas créer un groupe avec un order déjà existant dans le même profile
		it("should not allow duplicate group order for same profile", async () => {
			const user = await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Langages",
						order: 1,
						tags: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			await expect(
				prismaTest.profileTagGroup.create({
					data: { title: "Langages", order: 1, profileId: user.profile.id },
				}),
			).rejects.toThrow();
		});
	});

	//! 5 - DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer une tag d'un groupe
		it("should delete a tag from a group", async () => {
			const user = await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Langages",
						order: 1,
						tags: [
							{ name: "TypeScript", order: 1 },
							{ name: "React", order: 2 },
						],
					},
				],
			});
			const tag = user.profile!.tags![0]!.tags![0]!;
			await prismaTest.profileTag.delete({
				where: { id: tag.id },
			});
			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
				include: {
					tags: {
						include: { tags: true },
					},
				},
			});
			expect(updatedProfile!.tags!.length).toBe(1);
			expect(updatedProfile!.tags![0]!.tags.length).toBe(1);
		});

		// 5-2: peut supprimer un groupe de tags
		it("should delete a tag group", async () => {
			const user = await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Langages",
						order: 1,
						tags: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			await prismaTest.profileTagGroup.delete({
				where: { id: user.profile!.tags![0]!.id },
			});
			const updatedProfile = await prismaTest.profile.findUnique({
				where: { id: user.profile.id },
				include: {
					tags: {
						include: { tags: true },
					},
				},
			});
			expect(updatedProfile!.tags!.length).toBe(0);
		});

		// 5-3: supprime les tags quand le profile est supprimé
		it("should delete the tags when the profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				tagGroups: [
					{
						title: "Langages",
						order: 1,
						tags: [{ name: "TypeScript", order: 1 }],
					},
				],
			});
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const profiletags = await prismaTest.profileTag.findMany({
				where: { group: { profileId: user.profile.id } },
			});
			const tagGroups = await prismaTest.profileTagGroup.findMany({
				where: { profileId: user.profile.id },
			});
			const tags = await prismaTest.tag.findMany();
			expect(tagGroups!.length).toBe(0);
			expect(profiletags!.length).toBe(0);
			expect(tags!.length).toBe(1);
		});
	});

	//! 6- RELATIONS TESTS
	// describe('RELATIONS', () => {});
});
