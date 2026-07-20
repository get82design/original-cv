import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { profileService } from "../../../src/services/profile/profileService";
import { createTestProfile } from "../../utils/create-test-profile";
import { prismaTest } from "../../../lib/prismaTest";

describe("ProfileService.create", () => {
	// TEST 1 : création nominale
	it("creates a profile", async () => {
		const user = await createTestUser();

		const profile = await profileService.create(user.id, {
			firstName: "John",
			lastName: "Doe",
			phone: "0606060606",
			location: "Paris",
		});

		expect(profile.userId).toBe(user.id);
		expect(profile.firstName).toBe("John");
		expect(profile.lastName).toBe("Doe");
		expect(profile.phone).toBe("0606060606");
		expect(profile.location).toBe("Paris");
	});

	// TEST 2 : utilisateur inexistant
	it("throws if user does not exist", async () => {
		await expect(
			profileService.create("unknown-user", {
				firstName: "John",
				lastName: "Doe",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : impossible de créer deux profils pour un utilisateur
	it("throws if user already has a profile", async () => {
		const user = await createTestUser();
		await profileService.create(user.id, {
			firstName: "John",
			lastName: "Doe",
		});
		await expect(
			profileService.create(user.id, {
				firstName: "Jane",
				lastName: "Doe",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileService.findByUserId", () => {
	// TEST 1 : recherche nominale
	it("returns user profile", async () => {
		const user = await createTestUser();
		await createTestProfile(user.id, "John", "Doe");
		const profile = await profileService.findByUserId(user.id);

		expect(profile).not.toBeNull();
		expect(profile!.userId).toBe(user.id);
		expect(profile!.firstName).toBe("John");
		expect(profile!.lastName).toBe("Doe");
	});

	// TEST 2 : profil inexistant
	it("returns null if profile does not exist", async () => {
		const user = await createTestUser();
		const profile = await profileService.findByUserId(user.id);

		expect(profile).toBeNull();
	});

	// TEST 3 : utilisateur inexistant
	it("returns null if user does not exist", async () => {
		const profile = await profileService.findByUserId("unknown-user");

		expect(profile).toBeNull();
	});
});

describe("ProfileService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a profile", async () => {
		const user = await createTestUser();

		await createTestProfile(user.id, "John", "Doe");

		const updated = await profileService.update(user.id, {
			firstName: "Johnny",
			lastName: "Doe Updated",
		});

		expect(updated.userId).toBe(user.id);
		expect(updated.firstName).toBe("Johnny");
		expect(updated.lastName).toBe("Doe Updated");
	});

	// TEST 2 : profil inexistant
	it("throws if profile does not exist", async () => {
		const user = await createTestUser();

		await expect(
			profileService.update(user.id, {
				firstName: "John",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : mise à jour partielle
	it("updates only provided fields", async () => {
		const user = await createTestUser();

		await createTestProfile(user.id, "John", "Doe");

		const updated = await profileService.update(user.id, {
			firstName: "Johnny",
		});

		expect(updated.firstName).toBe("Johnny");
		expect(updated.lastName).toBe("Doe");
	});
});

describe("ProfileService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a profile", async () => {
		const user = await createTestUser();
		await createTestProfile(user.id, "John", "Doe");
		await profileService.delete(user.id);

		const profile = await prismaTest.profile.findUnique({
			where: {
				userId: user.id,
			},
		});
		expect(profile).toBeNull();
	});

	// TEST 2 : erreur si profil inexistant
	it("throws if profile does not exist", async () => {
		const user = await createTestUser();
		await expect(profileService.delete(user.id)).rejects.toThrow(NotFoundError);
	});
});
