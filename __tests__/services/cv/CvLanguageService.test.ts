import { describe, it, expect } from "vitest";
import { Level } from "../../../generated/prisma/enums";
import { createTestTemplate } from "../../utils/create-test-template";
import { createTestUser } from "../../utils/create-test-user";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvLanguageService } from "../../../src/services/cv/cvLanguageService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvLanguageService.create", () => {
	// TEST 1 : création nominale
	it("creates a language", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const language = await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});

		expect(language.cvId).toBe(cv.id);
		expect(language.name).toBe("Anglais");
		expect(language.level).toBe(Level.Intermédiaire);
		expect(language.order).toBe(1);
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvLanguageService.create("unknown-cv", {
				name: "Anglais",
				level: Level.Intermédiaire,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : language déjà existante pour le CV
	it("throws if language already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		await expect(
			cvLanguageService.create(cv.id, {
				name: "Anglais",
				level: Level.Senior,
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante pour le CV
	it("throws if order already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		await expect(
			cvLanguageService.create(cv.id, {
				name: "Français",
				level: Level.Débutant,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("defaults order to 0 when order is omitted", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const language = await cvLanguageService.create(cv.id, {
			name: "Allemand",
			level: Level.Débutant,
			// pas de order → data.order ?? 0
		});
		expect(language.order).toBe(0);
		expect(language.settings).toEqual({}); // bonus L63 : settings ?? {}
	});
});

describe("CvLanguageService.findAllByCvId", () => {
	// TEST 1 : retourne les languages ordonnés par order
	it("returns languages ordered by order", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		await cvLanguageService.create(cv.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		const result = await cvLanguageService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.name).toBe("Français");
		expect(result[1]!.name).toBe("Anglais");
	});

	// TEST 2 : retourne un tableau vide si le CV n'a pas de languages
	it("returns empty array if CV has no languages", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvLanguageService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : retourne uniquement les languages du CV donné
	it("only returns languages of given CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvLanguageService.create(cvA.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		await cvLanguageService.create(cvB.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		const result = await cvLanguageService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.name).toBe("Français");
	});
});

describe("CvLanguageService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a language", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const language = await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		const updated = await cvLanguageService.update(language.id, {
			level: Level.Senior,
		});

		expect(updated.name).toBe("Anglais");
		expect(updated.level).toBe(Level.Senior);
		expect(updated.order).toBe(1);
	});

	// TEST 2 : mise à jour du nom du language
	it("updates language name", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const language = await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 1,
		});
		const updated = await cvLanguageService.update(language.id, {
			name: "English",
		});

		expect(updated.name).toBe("English");
	});

	// TEST 3 : mise à jour du nom du language déjà existant
	it("throws if language name already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvLanguageService.create(cv.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		const language = await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		await expect(
			cvLanguageService.update(language.id, {
				name: "Français",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du language inexistant
	it("throws if language does not exist", async () => {
		await expect(
			cvLanguageService.update("unknown-id", {
				level: Level.Senior,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("updates settings when provided", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const language = await cvLanguageService.create(cv.id, {
			name: "Italien",
			level: Level.Intermédiaire,
			order: 1,
		});
		const settings = {
			language: {
				sizeModel: "16px",
				weightModel: 400,
				colorSelect: "primaryColor" as const,
				sizeSelect: "sm" as const,
				weightSelect: "sm" as const,
				withPrimaryColor: true,
				textAlign: "left" as const,
			},
			design: "stars" as const,
		};
		const updated = await cvLanguageService.update(language.id, { settings });
		expect(updated.settings).toEqual(settings);
	});
});

describe("CvLanguageService.move", () => {
	// TEST 1 : déplacement d'un language à une nouvelle position
	it("moves a language to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const french = await cvLanguageService.create(cv.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		const english = await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		const spanish = await cvLanguageService.create(cv.id, {
			name: "Espagnol",
			level: Level.Débutant,
			order: 3,
		});
		await cvLanguageService.move(spanish.id, 1);
		const result = await cvLanguageService.findAllByCvId(cv.id);

		expect(result[0]!.name).toBe("Espagnol");
		expect(result[1]!.name).toBe("Français");
		expect(result[2]!.name).toBe("Anglais");
	});

	// TEST 2 : déplacement d'un language inexistant
	it("throws if language does not exist", async () => {
		await expect(cvLanguageService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : déplacement d'un language à une position invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const language = await cvLanguageService.create(cv.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		await expect(cvLanguageService.move(language.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const language = await cvLanguageService.create(cv.id, {
					name: "Français",
					level: Level.Senior,
					order: 1,
				});
				return { id: language.id, order: language.order };
			},
			moveEntity: (id, order) => cvLanguageService.move(id, order),
		});
	});
});

describe("CvLanguageService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a language", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const language = await cvLanguageService.create(cv.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		await cvLanguageService.delete(language.id);
		const result = await cvLanguageService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : suppression d'un language inexistant
	it("throws if language does not exist", async () => {
		await expect(cvLanguageService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : reordonnancement des languages restants après suppression
	it("reorders remaining languages after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const french = await cvLanguageService.create(cv.id, {
			name: "Français",
			level: Level.Senior,
			order: 1,
		});
		const english = await cvLanguageService.create(cv.id, {
			name: "Anglais",
			level: Level.Intermédiaire,
			order: 2,
		});
		await cvLanguageService.create(cv.id, {
			name: "Espagnol",
			level: Level.Débutant,
			order: 3,
		});
		await cvLanguageService.delete(english.id);
		const result = await cvLanguageService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.name).toBe("Français");
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.name).toBe("Espagnol");
		expect(result[1]!.order).toBe(2);
	});
});
