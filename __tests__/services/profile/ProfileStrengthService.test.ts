import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileStrengthService } from "../../../src/services/profile/profileStrengthService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileStrengthService.create", () => {
	// TEST 1 : création nominale
	it("creates a strength", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const strength = await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			icon: "star",
			order: 1,
		});

		expect(strength.profileId).toBe(profile.id);
		expect(strength.title).toBe("Autonomie");
		expect(strength.icon).toBe("star");
		expect(strength.order).toBe(1);
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileStrengthService.create("unknown-profile", {
				title: "Autonomie",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : titre déjà existant
	it("throws if title already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileStrengthService.create(profile.id, {
			title: "Autonomie",
		});
		await expect(
			profileStrengthService.create(profile.id, {
				title: "Autonomie",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : ordre déjà existant
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			order: 1,
		});
		await expect(
			profileStrengthService.create(profile.id, {
				title: "Communication",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileStrengthService.findAllByProfileId", () => {
	// TEST 1 : retourne les forces ordonnées par ordre
	it("returns strengths ordered by order", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileStrengthService.create(profile.id, {
			title: "Communication",
			order: 2,
		});
		await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			order: 1,
		});
		const result = await profileStrengthService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Autonomie");
		expect(result[1]!.title).toBe("Communication");
	});

	// TEST 2 : retourne un tableau vide si le Profile n'a pas de forces
	it("returns empty array if Profile has no strengths", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileStrengthService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : retourne uniquement les forces du Profile donné
	it("only returns strengths of given Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "John", "Doe");
		await profileStrengthService.create(profileA.id, {
			title: "Autonomie",
		});
		await profileStrengthService.create(profileB.id, {
			title: "Communication",
		});
		const result = await profileStrengthService.findAllByProfileId(profileA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Autonomie");
	});
});

describe("ProfileStrengthService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a strength", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const strength = await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			icon: "old-icon",
			order: 1,
		});
		const updated = await profileStrengthService.update(strength.id, {
			title: "Leadership",
			icon: "new-icon",
		});

		expect(updated.title).toBe("Leadership");
		expect(updated.icon).toBe("new-icon");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : force inexistante
	it("throws if strength does not exist", async () => {
		await expect(
			profileStrengthService.update("unknown-id", {
				title: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : titre déjà existant
	it("throws if title already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			order: 1,
		});
		const strength = await profileStrengthService.create(profile.id, {
			title: "Communication",
			order: 2,
		});
		await expect(
			profileStrengthService.update(strength.id, {
				title: "Autonomie",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour de l'icône uniquement
	it("allows updating icon only", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const strength = await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			icon: "old",
			order: 1,
		});
		const updated = await profileStrengthService.update(strength.id, {
			icon: "new",
		});

		expect(updated.title).toBe("Autonomie");
		expect(updated.icon).toBe("new");
	});
});

describe("ProfileStrengthService.move", () => {
	// TEST 1 : déplacement vers une position supérieure
	it("moves a strength to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const autonomy = await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			order: 1,
		});
		const communication = await profileStrengthService.create(profile.id, {
			title: "Communication",
			order: 2,
		});
		await profileStrengthService.move(communication.id, 1);
		const result = await profileStrengthService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(communication.id);
		expect(result[1]!.id).toBe(autonomy.id);
	});

	// TEST 2 : force inexistante
	it("throws if strength does not exist", async () => {
		await expect(profileStrengthService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const strength = await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			order: 1,
		});
		await expect(profileStrengthService.move(strength.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const strength = await profileStrengthService.create(profile.id, {
					title: "Autonomie",
					order: 1,
				});
				return { id: strength.id, order: strength.order };
			},
			moveEntity: (id, order) => profileStrengthService.move(id, order),
		});
	});
});

describe("ProfileStrengthService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a strength", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const strength = await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			order: 1,
		});
		await profileStrengthService.delete(strength.id);
		const result = await profileStrengthService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : force inexistante
	it("throws if strength does not exist", async () => {
		await expect(profileStrengthService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : reordonnement des forces restantes après suppression
	it("reorders remaining strengths after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const autonomy = await profileStrengthService.create(profile.id, {
			title: "Autonomie",
			order: 1,
		});
		const communication = await profileStrengthService.create(profile.id, {
			title: "Communication",
			order: 2,
		});
		await profileStrengthService.create(profile.id, {
			title: "Leadership",
			order: 3,
		});
		await profileStrengthService.delete(communication.id);
		const result = await profileStrengthService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Autonomie");
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.title).toBe("Leadership");
		expect(result[1]!.order).toBe(2);
	});
});
