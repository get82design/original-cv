import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileDescriptionService } from "../../../src/services/profile/profileDescriptionService";

describe("ProfileDescriptionService.create", () => {
	// TEST 1 : création nominale
	it("creates a description", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const description = await profileDescriptionService.create(profile.id, {
			description: "Développeur fullstack passionné",
		});

		expect(description.profileId).toBe(profile.id);
		expect(description.description).toBe("Développeur fullstack passionné");
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileDescriptionService.create("unknown-profile", {
				description: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : description déjà existante
	it("throws if description already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileDescriptionService.create(profile.id, {
			description: "Première description",
		});

		await expect(
			profileDescriptionService.create(profile.id, {
				description: "Deuxième description",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileDescriptionService.findByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns the description of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const created = await profileDescriptionService.create(profile.id, {
			description: "Développeur fullstack",
		});
		const result = await profileDescriptionService.findByProfileId(profile.id);

		expect(result.id).toBe(created.id);
		expect(result.profileId).toBe(profile.id);
		expect(result.description).toBe("Développeur fullstack");
	});

	// TEST 2 : description inexistante
	it("throws if description does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await expect(
			profileDescriptionService.findByProfileId(profile.id),
		).rejects.toThrow(NotFoundError);
	});
});

describe("ProfileDescriptionService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a description", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await profileDescriptionService.create(profile.id, {
			description: "Ancienne description",
		});

		const updated = await profileDescriptionService.update(profile.id, {
			description: "Nouvelle description",
		});

		expect(updated.description).toBe("Nouvelle description");
	});

	// TEST 2 : description inexistante
	it("throws if description does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await expect(
			profileDescriptionService.update(profile.id, {
				description: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("ProfileDescriptionService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a description", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await profileDescriptionService.create(profile.id, {
			description: "Ma description",
		});

		await profileDescriptionService.delete(profile.id);

		await expect(
			profileDescriptionService.findByProfileId(profile.id),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 2 : description inexistante
	it("throws if description does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await expect(profileDescriptionService.delete(profile.id)).rejects.toThrow(
			NotFoundError,
		);
	});
});
