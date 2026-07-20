import { describe, expect, it } from "vitest";
import { Level } from "../../../generated/prisma/enums";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileExpertiseService } from "../../../src/services/profile/profileExpertiseService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileExpertiseService.create", () => {
	// TEST 1 : création d'une expertise
	it("creates a expertise", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const expertise = await profileExpertiseService.create(profile.id, {
			title: "Développement web",
			level: Level.Intermédiaire,
			order: 1,
		});

		expect(expertise.profileId).toBe(profile.id);
		expect(expertise.title).toBe("Développement web");
		expect(expertise.level).toBe(Level.Intermédiaire);
		expect(expertise.order).toBe(1);
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileExpertiseService.create("unknown-profile", {
				title: "Développement web",
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : title déjà existant pour le Profile
	it("throws if title already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExpertiseService.create(profile.id, {
			title: "Développement web",
			level: Level.Intermédiaire,
			order: 1,
		});
		await expect(
			profileExpertiseService.create(profile.id, {
				title: "Développement web",
				level: Level.Senior,
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante pour le Profile
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExpertiseService.create(profile.id, {
			title: "Développement web",
			level: Level.Intermédiaire,
			order: 1,
		});
		await expect(
			profileExpertiseService.create(profile.id, {
				title: "Développement back",
				level: Level.Débutant,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileExpertiseService.findAllByProfileId", () => {
	// TEST 1 : retourne toutes les expertises d'un Profile
	it("returns expertises for a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExpertiseService.create(profile.id, {
			title: "React",
			level: Level.Senior,
			order: 2,
		});
		await profileExpertiseService.create(profile.id, {
			title: "TypeScript",
			level: Level.Intermédiaire,
			order: 1,
		});
		const result = await profileExpertiseService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("TypeScript");
		expect(result[1]!.title).toBe("React");
	});

	// TEST 2 : retourne un tableau vide si le Profile n'a pas d'expertises
	it("returns empty array if Profile has no expertises", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileExpertiseService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});
});

describe("ProfileExpertiseService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a expertise", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const expertise = await profileExpertiseService.create(profile.id, {
			title: "Developpeur Web",
			level: Level.Intermédiaire,
			order: 1,
		});
		const updated = await profileExpertiseService.update(expertise.id, {
			level: Level.Senior,
		});

		expect(updated.title).toBe("Developpeur Web");
		expect(updated.level).toBe(Level.Senior);
		expect(updated.order).toBe(1);
	});

	// TEST 2 : mise à jour du nom du expertise
	it("updates expertise title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const expertise = await profileExpertiseService.create(profile.id, {
			title: "Developpeur Web",
			level: Level.Intermédiaire,
			order: 1,
		});
		const updated = await profileExpertiseService.update(expertise.id, {
			title: "SEO",
		});

		expect(updated.title).toBe("SEO");
	});

	// TEST 3 : mise à jour du nom du expertise déjà existant
	it("throws if expertise title already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExpertiseService.create(profile.id, {
			title: "Testeur",
			level: Level.Senior,
			order: 1,
		});
		const expertise = await profileExpertiseService.create(profile.id, {
			title: "Developpeur Web",
			level: Level.Intermédiaire,
			order: 2,
		});
		await expect(
			profileExpertiseService.update(expertise.id, {
				title: "Testeur",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du expertise inexistant
	it("throws if expertise does not exist", async () => {
		await expect(
			profileExpertiseService.update("unknown-id", {
				level: Level.Senior,
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("ProfileExpertiseService.move", () => {
	// TEST 1 : déplacement d'un expertise à une nouvelle position
	it("moves a expertise to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const french = await profileExpertiseService.create(profile.id, {
			title: "Français",
			level: Level.Senior,
			order: 1,
		});
		const english = await profileExpertiseService.create(profile.id, {
			title: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		const spanish = await profileExpertiseService.create(profile.id, {
			title: "Espagnol",
			level: Level.Débutant,
			order: 3,
		});
		await profileExpertiseService.move(spanish.id, 1);
		const result = await profileExpertiseService.findAllByProfileId(profile.id);

		expect(result[0]!.title).toBe("Espagnol");
		expect(result[1]!.title).toBe("Français");
		expect(result[2]!.title).toBe("Anglais");
	});

	// TEST 2 : déplacement d'un expertise inexistant
	it("throws if expertise does not exist", async () => {
		await expect(profileExpertiseService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : déplacement d'un expertise à une position invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const expertise = await profileExpertiseService.create(profile.id, {
			title: "Français",
			level: Level.Senior,
			order: 1,
		});
		await expect(
			profileExpertiseService.move(expertise.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const expertise = await profileExpertiseService.create(profile.id, {
					title: "Français",
					level: Level.Senior,
					order: 1,
				});
				return { id: expertise.id, order: expertise.order };
			},
			moveEntity: (id, order) => profileExpertiseService.move(id, order),
		});
	});
});

describe("ProfileExpertiseService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a expertise", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const expertise = await profileExpertiseService.create(profile.id, {
			title: "Français",
			level: Level.Senior,
			order: 1,
		});
		await profileExpertiseService.delete(expertise.id);
		const result = await profileExpertiseService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : suppression d'un expertise inexistant
	it("throws if expertise does not exist", async () => {
		await expect(profileExpertiseService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : reordonnancement des expertises restants après suppression
	it("reorders remaining expertises after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const french = await profileExpertiseService.create(profile.id, {
			title: "Français",
			level: Level.Senior,
			order: 1,
		});
		const english = await profileExpertiseService.create(profile.id, {
			title: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		await profileExpertiseService.create(profile.id, {
			title: "Espagnol",
			level: Level.Débutant,
			order: 3,
		});
		await profileExpertiseService.delete(english.id);
		const result = await profileExpertiseService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Français");
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.title).toBe("Espagnol");
		expect(result[1]!.order).toBe(2);
	});
});
