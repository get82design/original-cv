import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileSocialMediaService } from "../../../src/services/profile/profileSocialMediaService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileSocialMediaService.create", () => {
	// TEST 1 : création nominale
	it("creates a social media", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const socialMedia = await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
			order: 1,
		});

		expect(socialMedia.profileId).toBe(profile.id);
		expect(socialMedia.socialNetwork).toBe("LinkedIn");
		expect(socialMedia.username).toBe("john");
		expect(socialMedia.order).toBe(1);
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileSocialMediaService.create("unknown-profile", {
				socialNetwork: "LinkedIn",
				username: "john",
				icon: "faLinkedin",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : social network déjà existante
	it("throws if social network already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
		});
		await expect(
			profileSocialMediaService.create(profile.id, {
				socialNetwork: "LinkedIn",
				username: "another-user",
				icon: "faLinkedin",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
			order: 1,
		});

		await expect(
			profileSocialMediaService.create(profile.id, {
				socialNetwork: "Github",
				username: "john-dev",
				icon: "faGithub",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileSocialMediaService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns social medias of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
			order: 1,
		});

		await profileSocialMediaService.create(profile.id, {
			socialNetwork: "Github",
			username: "john-dev",
			icon: "faGithub",
			order: 2,
		});

		const result = await profileSocialMediaService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.socialNetwork).toBe("LinkedIn");
		expect(result[1]!.socialNetwork).toBe("Github");
	});

	// TEST 2 : pas de social media existant
	it("returns empty array if no social media exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const result = await profileSocialMediaService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de social media d'un autre Profile
	it("does not return social medias from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "Jane", "Doe");
		await profileSocialMediaService.create(profileA.id, {
			socialNetwork: "LinkedIn",
			username: "user-a",
			icon: "faLinkedin",
		});
		await profileSocialMediaService.create(profileB.id, {
			socialNetwork: "Github",
			username: "user-b",
			icon: "faGithub",
		});
		const result = await profileSocialMediaService.findAllByProfileId(profileA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.username).toBe("user-a");
	});
});

describe("ProfileSocialMediaService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a social media", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const socialMedia = await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "old-user",
			icon: "faLinkedin",
			order: 1,
		});
		const updated = await profileSocialMediaService.update(socialMedia.id, {
			username: "new-user",
		});

		expect(updated.username).toBe("new-user");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : social media inexistant
	it("throws if social media does not exist", async () => {
		await expect(
			profileSocialMediaService.update("unknown-id", {
				username: "test",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : social network déjà existante
	it("throws if new social network already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
			order: 1,
		});
		const github = await profileSocialMediaService.create(profile.id, {
			socialNetwork: "Github",
			username: "john-dev",
			icon: "faGithub",
			order: 2,
		});
		await expect(
			profileSocialMediaService.update(github.id, {
				socialNetwork: "LinkedIn",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileSocialMediaService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a social media to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const linkedin = await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
			order: 1,
		});
		const github = await profileSocialMediaService.create(profile.id, {
			socialNetwork: "Github",
			username: "dev",
			icon: "faGithub",
			order: 2,
		});
		await profileSocialMediaService.move(github.id, 1);
		const result = await profileSocialMediaService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(github.id);
		expect(result[1]!.id).toBe(linkedin.id);
	});

	// TEST 2 : social media inexistant
	it("throws if social media does not exist", async () => {
		await expect(profileSocialMediaService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const social = await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
		});
		await expect(profileSocialMediaService.move(social.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const socialMedia = await profileSocialMediaService.create(profile.id, {
					socialNetwork: "LinkedIn",
					username: "john",
					icon: "faLinkedin",
					order: 1,
				});
				return { id: socialMedia.id, order: socialMedia.order };
			},
			moveEntity: (id, order) => profileSocialMediaService.move(id, order),
		});
	});
});

describe("ProfileSocialMediaService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a social media", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const socialMedia = await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
			order: 1,
		});
		await profileSocialMediaService.delete(socialMedia.id);
		const result = await profileSocialMediaService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : social media inexistant
	it("throws if social media does not exist", async () => {
		await expect(profileSocialMediaService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des social medias après suppression
	it("reorders remaining social medias after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileSocialMediaService.create(profile.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			icon: "faLinkedin",
			order: 1,
		});
		const github = await profileSocialMediaService.create(profile.id, {
			socialNetwork: "Github",
			username: "dev",
			icon: "faGithub",
			order: 2,
		});
		await profileSocialMediaService.create(profile.id, {
			socialNetwork: "Twitter",
			username: "twitter",
			icon: "faTwitter",
			order: 3,
		});
		await profileSocialMediaService.delete(github.id);
		const result = await profileSocialMediaService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.socialNetwork).toBe("Twitter");
	});
});
