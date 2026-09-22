import { describe, it, expect } from "vitest";
import { Level } from "../../../generated/prisma/enums";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileLanguageService } from "../../../src/services/profile/profileLanguageService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileLanguageService.create", () => {
	// TEST 1 : création nominale
	it("creates a language", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const language = await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});

		expect(language.profileId).toBe(profile.id);
		expect(language.name).toBe("Anglais");
		expect(language.level).toBe(Level.Intermédiaire);
		expect(language.order).toBe(1);
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileLanguageService.create("unknown-profile", {
				name: "Anglais",
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : language déjà existante pour le Profile
	it("throws if language already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		await expect(
			profileLanguageService.create(profile.id, {
				name: "Anglais",
				level: Level.Senior,
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante pour le Profile
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		await expect(
			profileLanguageService.create(profile.id, {
				name: "Français",
				level: Level.Débutant,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileLanguageService.findAllByProfileId", () => {
	// TEST 1 : retourne les languages ordonnés par order
	it("returns languages ordered by order", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		await profileLanguageService.create(profile.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		const result = await profileLanguageService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.name).toBe("Français");
		expect(result[1]!.name).toBe("Anglais");
	});

	// TEST 2 : retourne un tableau vide si le Profile n'a pas de languages
	it("returns empty array if Profile has no languages", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileLanguageService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : retourne uniquement les languages du Profile donné
	it("only returns languages of given Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "John", "Doe");
		await profileLanguageService.create(profileA.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		await profileLanguageService.create(profileB.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		const result = await profileLanguageService.findAllByProfileId(profileA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.name).toBe("Français");
	});
});

describe("ProfileLanguageService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a language", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const language = await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		const updated = await profileLanguageService.update(language.id, {
			level: Level.Senior,
		});

		expect(updated.name).toBe("Anglais");
		expect(updated.level).toBe(Level.Senior);
		expect(updated.order).toBe(1);
	});

	// TEST 2 : mise à jour du nom du language
	it("updates language name", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const language = await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		const updated = await profileLanguageService.update(language.id, {
			name: "English",
		});

		expect(updated.name).toBe("English");
	});

	// TEST 3 : mise à jour du nom du language déjà existant
	it("throws if language name already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileLanguageService.create(profile.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		const language = await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		await expect(
			profileLanguageService.update(language.id, {
				name: "Français",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du language inexistant
	it("throws if language does not exist", async () => {
		await expect(
			profileLanguageService.update("unknown-id", {
				level: Level.Senior,
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("ProfileLanguageService.move", () => {
	// TEST 1 : déplacement d'un language à une nouvelle position
	it("moves a language to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const french = await profileLanguageService.create(profile.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		const english = await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		const spanish = await profileLanguageService.create(profile.id, {
			name: "Espagnol",
			level: Level.Débutant,
			order: 3,
		});
		await profileLanguageService.move(spanish.id, 1);
		const result = await profileLanguageService.findAllByProfileId(profile.id);

		expect(result[0]!.name).toBe("Espagnol");
		expect(result[1]!.name).toBe("Français");
		expect(result[2]!.name).toBe("Anglais");
	});

	// TEST 2 : déplacement d'un language inexistant
	it("throws if language does not exist", async () => {
		await expect(profileLanguageService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : déplacement d'un language à une position invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const language = await profileLanguageService.create(profile.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		await expect(profileLanguageService.move(language.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const language = await profileLanguageService.create(profile.id, {
					name: "Français",
					level: Level.Senior,
					order: 1,
				});
				return { id: language.id, order: language.order };
			},
			moveEntity: (id, order) => profileLanguageService.move(id, order),
		});
	});
});

describe("ProfileLanguageService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a language", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const language = await profileLanguageService.create(profile.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		await profileLanguageService.delete(language.id);
		const result = await profileLanguageService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : suppression d'un language inexistant
	it("throws if language does not exist", async () => {
		await expect(profileLanguageService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : reordonnancement des languages restants après suppression
	it("reorders remaining languages after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const french = await profileLanguageService.create(profile.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		const english = await profileLanguageService.create(profile.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		await profileLanguageService.create(profile.id, {
			name: "Espagnol",
			level: Level.Débutant,
			order: 3,
		});
		await profileLanguageService.delete(english.id);
		const result = await profileLanguageService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.name).toBe("Français");
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.name).toBe("Espagnol");
		expect(result[1]!.order).toBe(2);
	});
});
