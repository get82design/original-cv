import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvStrengthService } from "../../../src/services/cv/cvStrengthService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvStrengthService.create", () => {
	// TEST 1 : création nominale
	it("creates a strength", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const strength = await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			icon: "star",
			order: 1,
		});

		expect(strength.cvId).toBe(cv.id);
		expect(strength.title).toBe("Autonomie");
		expect(strength.icon).toBe("star");
		expect(strength.order).toBe(1);
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvStrengthService.create("unknown-cv", {
				title: "Autonomie",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : titre déjà existant
	it("throws if title already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvStrengthService.create(cv.id, {
			title: "Autonomie",
		});
		await expect(
			cvStrengthService.create(cv.id, {
				title: "Autonomie",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : ordre déjà existant
	it("throws if order already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			order: 1,
		});
		await expect(
			cvStrengthService.create(cv.id, {
				title: "Communication",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvStrengthService.findAllByCvId", () => {
	// TEST 1 : retourne les forces ordonnées par ordre
	it("returns strengths ordered by order", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvStrengthService.create(cv.id, {
			title: "Communication",
			order: 2,
		});
		await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			order: 1,
		});
		const result = await cvStrengthService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Autonomie");
		expect(result[1]!.title).toBe("Communication");
	});

	// TEST 2 : retourne un tableau vide si le CV n'a pas de forces
	it("returns empty array if CV has no strengths", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvStrengthService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : retourne uniquement les forces du CV donné
	it("only returns strengths of given CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvStrengthService.create(cvA.id, {
			title: "Autonomie",
		});
		await cvStrengthService.create(cvB.id, {
			title: "Communication",
		});
		const result = await cvStrengthService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Autonomie");
	});
});

describe("CvStrengthService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a strength", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const strength = await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			icon: "old-icon",
			order: 1,
		});
		const updated = await cvStrengthService.update(strength.id, {
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
			cvStrengthService.update("unknown-id", {
				title: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : titre déjà existant
	it("throws if title already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			order: 1,
		});
		const strength = await cvStrengthService.create(cv.id, {
			title: "Communication",
			order: 2,
		});
		await expect(
			cvStrengthService.update(strength.id, {
				title: "Autonomie",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour de l'icône uniquement
	it("allows updating icon only", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const strength = await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			icon: "old",
			order: 1,
		});
		const updated = await cvStrengthService.update(strength.id, {
			icon: "new",
		});

		expect(updated.title).toBe("Autonomie");
		expect(updated.icon).toBe("new");
	});
});

describe("CvStrengthService.move", () => {
	// TEST 1 : déplacement vers une position supérieure
	it("moves a strength to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const autonomy = await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			order: 1,
		});
		const communication = await cvStrengthService.create(cv.id, {
			title: "Communication",
			order: 2,
		});
		await cvStrengthService.move(communication.id, 1);
		const result = await cvStrengthService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(communication.id);
		expect(result[1]!.id).toBe(autonomy.id);
	});

	// TEST 2 : force inexistante
	it("throws if strength does not exist", async () => {
		await expect(cvStrengthService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const strength = await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			order: 1,
		});
		await expect(cvStrengthService.move(strength.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const strength = await cvStrengthService.create(cv.id, {
					title: "Autonomie",
					order: 1,
				});
				return { id: strength.id, order: strength.order };
			},
			moveEntity: (id, order) => cvStrengthService.move(id, order),
		});
	});
});

describe("CvStrengthService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a strength", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const strength = await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			order: 1,
		});
		await cvStrengthService.delete(strength.id);
		const result = await cvStrengthService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : force inexistante
	it("throws if strength does not exist", async () => {
		await expect(cvStrengthService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : reordonnement des forces restantes après suppression
	it("reorders remaining strengths after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const autonomy = await cvStrengthService.create(cv.id, {
			title: "Autonomie",
			order: 1,
		});
		const communication = await cvStrengthService.create(cv.id, {
			title: "Communication",
			order: 2,
		});
		await cvStrengthService.create(cv.id, {
			title: "Leadership",
			order: 3,
		});
		await cvStrengthService.delete(communication.id);
		const result = await cvStrengthService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Autonomie");
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.title).toBe("Leadership");
		expect(result[1]!.order).toBe(2);
	});
});
