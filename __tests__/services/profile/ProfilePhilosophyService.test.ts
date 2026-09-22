import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profilePhilosophyService } from "../../../src/services/profile/profilePhilosophyService";

describe("ProfilePhilosophyService.create", () => {
	// TEST 1 : création nominale
	it("creates a philosophy", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const philosophy = await profilePhilosophyService.create(profile.id, {
			citation: "La simplicité est la sophistication suprême",
			author: "Léonard de Vinci",
		});

		expect(philosophy.profileId).toBe(profile.id);
		expect(philosophy.citation).toBe("La simplicité est la sophistication suprême");
		expect(philosophy.author).toBe("Léonard de Vinci");
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profilePhilosophyService.create("unknown-profile", {
				citation: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : philosophy déjà existante
	it("throws if philosophy already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await profilePhilosophyService.create(profile.id, {
			citation: "Première",
		});
		await expect(
			profilePhilosophyService.create(profile.id, {
				citation: "Deuxième",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : création sans auteur
	it("creates a philosophy without author", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const philosophy = await profilePhilosophyService.create(profile.id, {
			citation: "Ma philosophie",
		});

		expect(philosophy.citation).toBe("Ma philosophie");
		expect(philosophy.author).toBeNull();
	});
});

describe("ProfilePhilosophyService.findByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns the philosophy of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const created = await profilePhilosophyService.create(profile.id, {
			citation: "La simplicité est la clé",
			author: "John Doe",
		});
		const result = await profilePhilosophyService.findByProfileId(profile.id);

		expect(result.id).toBe(created.id);
		expect(result.profileId).toBe(profile.id);
		expect(result.citation).toBe("La simplicité est la clé");
		expect(result.author).toBe("John Doe");
	});

	// TEST 2 : philosophy inexistante
	it("throws if philosophy does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await expect(profilePhilosophyService.findByProfileId(profile.id)).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("ProfilePhilosophyService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a philosophy", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePhilosophyService.create(profile.id, {
			citation: "Ancienne citation",
			author: "Ancien auteur",
		});
		const updated = await profilePhilosophyService.update(profile.id, {
			citation: "Nouvelle citation",
		});

		expect(updated.citation).toBe("Nouvelle citation");
		expect(updated.author).toBe("Ancien auteur");
	});

	// TEST 2 : philosophy inexistante
	it("throws if philosophy does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		await expect(
			profilePhilosophyService.update(profile.id, {
				citation: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("ProfilePhilosophyService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a philosophy", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePhilosophyService.create(profile.id, {
			citation: "Ma philosophie",
		});
		await profilePhilosophyService.delete(profile.id);
		await expect(profilePhilosophyService.findByProfileId(profile.id)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 2 : philosophy inexistante
	it("throws if philosophy does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(profilePhilosophyService.delete(profile.id)).rejects.toThrow(NotFoundError);
	});
});
