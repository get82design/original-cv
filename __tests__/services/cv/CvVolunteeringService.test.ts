import { describe, expect, it } from "vitest";
import { cvVolunteeringService } from "../../../src/services/cv/cvVolunteeringService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvVolunteeringService.create", () => {
	// TEST 1 : création nominale
	it("creates a volunteering", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			start: new Date("2020-01-01"),
			organisation: "Organisation 1",
			missions: [],
			order: 1,
		});

		expect(volunteering.cvId).toBe(cv.id);
		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organisation 1");
		expect(volunteering.order).toBe(1);
		expect(volunteering.start).toStrictEqual(new Date("2020-01-01"));
		expect(volunteering.end).toBeNull();
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvVolunteeringService.create("unknown-cv", {
				title: "Volunteering 1",
				organisation: "Organisation 1",
				missions: [],
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : volunteering déjà existante
	it("throws if volunteering already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			description: "Description 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			cvVolunteeringService.create(cv.id, {
				title: "Volunteering 1",
				description: "Description 1",
				organisation: "Organisation 1",
				missions: [],
				start: new Date("2020-01-01"),
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			description: "Description 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			cvVolunteeringService.create(cv.id, {
				title: "Volunteering 2",
				description: "Description 2",
				location: "Location 2",
				organisation: "Organisation 2",
				missions: [],
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	// Test 5 : Volunteering en cours
	it("creates a volunteering in progress", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(volunteering.cvId).toBe(cv.id);
		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organisation 1");
		expect(volunteering.order).toBe(1);
		expect(volunteering.start).toStrictEqual(new Date("2020-01-01"));
		expect(volunteering.end).toBeNull();
	});

	// Test 6 : Volunteering terminé
	it("creates a completed volunteering", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(volunteering.cvId).toBe(cv.id);
		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organisation 1");
		expect(volunteering.order).toBe(1);
		expect(volunteering.start).toStrictEqual(new Date("2020-01-01"));
	});

	// Test 7 : start avant end
	it("throws if start date is before end date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(
			cvVolunteeringService.create(cv.id, {
				title: "Volunteering 1",
				organisation: "Organisation 1",
				missions: [],
				start: new Date("2020-01-01"),
				end: new Date("2019-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("CvVolunteeringService.findAllByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns volunteerings of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await cvVolunteeringService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Volunteering 1");
		expect(result[1]!.title).toBe("Volunteering 2");
	});

	// TEST 2 : pas de volunteering existant
	it("returns empty array if no volunteering exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvVolunteeringService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de volunteering d'un autre CV
	it("does not return volunteerings from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvVolunteeringService.create(cvA.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvVolunteeringService.create(cvB.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const result = await cvVolunteeringService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Volunteering 1");
	});
});

describe("CvVolunteeringService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a Volunteering", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await cvVolunteeringService.update(volunteering.id, {
			organisation: "Organisation 2",
			missions: [],
		});

		expect(updated.organisation).toBe("Organisation 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : volunteering inexistant
	it("throws if volunteering does not exist", async () => {
		await expect(
			cvVolunteeringService.update("unknown-id", {
				organisation: "Organisation 2",
				missions: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : volunteering déjà existante
	it("throws if new volunteering already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const volunteering2 = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await expect(
			cvVolunteeringService.update(volunteering2.id, {
				title: "Volunteering 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates volunteering title", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await cvVolunteeringService.update(volunteering.id, {
			title: "Volunteering 2",
		});

		expect(updated.title).toBe("Volunteering 2");
	});

	// Test 6 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			cvVolunteeringService.update(volunteering.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 9 : end avant start mais en modifiant start
	it("throws if end date is before start date but start date is modified", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			cvVolunteeringService.update(volunteering.id, {
				start: new Date("2023-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("CvVolunteeringService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a volunteering to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering1 = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const volunteering2 = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvVolunteeringService.move(volunteering2.id, 1);
		const result = await cvVolunteeringService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(volunteering2.id);
		expect(result[1]!.id).toBe(volunteering1.id);
	});

	// TEST 2 : volunteering inexistant
	it("throws if volunteering does not exist", async () => {
		await expect(cvVolunteeringService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering1 = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			cvVolunteeringService.move(volunteering1.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const volunteering = await cvVolunteeringService.create(cv.id, {
					title: "Volunteering 1",
					organisation: "Organisation 1",
					missions: [],
					start: new Date("2020-01-01"),
					order: 1,
				});
				return { id: volunteering.id, order: volunteering.order };
			},
			moveEntity: (id, order) => cvVolunteeringService.move(id, order),
		});
	});
});

describe("CvVolunteeringService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a volunteering", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const volunteering1 = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvVolunteeringService.delete(volunteering1.id);
		const result = await cvVolunteeringService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : volunteering inexistant
	it("throws if volunteering does not exist", async () => {
		await expect(cvVolunteeringService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : réorganisation des volunteerings après suppression
	it("reorders remaining volunteerings after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const volunteering2 = await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvVolunteeringService.create(cv.id, {
			title: "Volunteering 3",
			organisation: "Organisation 3",
			missions: [],
			start: new Date("2020-01-01"),
			order: 3,
		});
		await cvVolunteeringService.delete(volunteering2.id);
		const result = await cvVolunteeringService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.title).toBe("Volunteering 3");
		expect(result[0]!.title).toBe("Volunteering 1");
		expect(result[1]!.title).toBe("Volunteering 3");
	});
});
