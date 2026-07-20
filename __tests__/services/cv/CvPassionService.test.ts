import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvPassionService } from "../../../src/services/cv/cvPassionService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvPassionService.create", () => {
	// TEST 1 : création d'une passion
	it("creates a passion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const passion = await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});

		expect(passion.cvId).toBe(cv.id);
		expect(passion.title).toBe("Voyage");
		expect(passion.icon).toBe("plane");
		expect(passion.order).toBe(1);
	});

	// TEST 2 : création d'une passion avec un CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvPassionService.create("unknown-cv", {
				title: "Voyage",
				icon: "plane",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : création d'une passion avec un titre déjà existant pour le CV
	it("throws if title already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await expect(
			cvPassionService.create(cv.id, {
				title: "Voyage",
				icon: "ship",
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : création d'une passion avec un ordre déjà existant pour le CV
	it("throws if order already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await expect(
			cvPassionService.create(cv.id, {
				title: "Sport",
				icon: "ball",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvPassionService.findAllByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns passions for a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await cvPassionService.create(cv.id, {
			title: "Photographie",
			icon: "camera",
			order: 2,
		});
		const result = await cvPassionService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Voyage");
		expect(result[1]!.title).toBe("Photographie");
	});

	// TEST 2 : pas de passions
	it("returns empty array if CV has no passions", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvPassionService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});
});

describe("CvPassionService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a passion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const passion = await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		const updated = await cvPassionService.update(passion.id, {
			icon: "globe",
		});

		expect(updated.title).toBe("Voyage");
		expect(updated.icon).toBe("globe");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : mise à jour du titre
	it("updates passion title", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const passion = await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		const updated = await cvPassionService.update(passion.id, {
			title: "Photographie",
		});

		expect(updated.title).toBe("Photographie");
	});

	// TEST 3 : mise à jour du titre déjà existant
	it("throws if title already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		const passion = await cvPassionService.create(cv.id, {
			title: "Sport",
			icon: "ball",
			order: 2,
		});
		await expect(
			cvPassionService.update(passion.id, {
				title: "Voyage",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : passion inexistante
	it("throws if passion does not exist", async () => {
		await expect(
			cvPassionService.update("unknown-id", {
				title: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("CvPassionService.move", () => {
	// TEST 1 : déplacement d'une passion
	it("moves a passion to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await cvPassionService.create(cv.id, {
			title: "Sport",
			icon: "ball",
			order: 2,
		});
		const reading = await cvPassionService.create(cv.id, {
			title: "Lecture",
			icon: "book",
			order: 3,
		});
		await cvPassionService.move(reading.id, 1);
		const result = await cvPassionService.findAllByCvId(cv.id);

		expect(result[0]!.title).toBe("Lecture");
		expect(result[1]!.title).toBe("Voyage");
		expect(result[2]!.title).toBe("Sport");
	});

	// TEST 2 : passion inexistante
	it("throws if passion does not exist", async () => {
		await expect(cvPassionService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const passion = await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await expect(cvPassionService.move(passion.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const passion = await cvPassionService.create(cv.id, {
					title: "Voyage",
					icon: "plane",
					order: 1,
				});
				return { id: passion.id, order: passion.order };
			},
			moveEntity: (id, order) => cvPassionService.move(id, order),
		});
	});
});

describe("CvPassionService.delete", () => {
	// TEST 1 : suppression d'une passion
	it("deletes a passion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const passion = await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await cvPassionService.delete(passion.id);
		const result = await cvPassionService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : passion inexistante
	it("throws if passion does not exist", async () => {
		await expect(cvPassionService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : reordonnancement des passions après suppression
	it("reorders remaining passions after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPassionService.create(cv.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		const sport = await cvPassionService.create(cv.id, {
			title: "Sport",
			icon: "ball",
			order: 2,
		});
		await cvPassionService.create(cv.id, {
			title: "Lecture",
			icon: "book",
			order: 3,
		});
		await cvPassionService.delete(sport.id);
		const result = await cvPassionService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Voyage");
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.title).toBe("Lecture");
		expect(result[1]!.order).toBe(2);
	});
});
