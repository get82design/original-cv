import { describe, expect, it } from "vitest";
import { cvExperienceService } from "../../../src/services/cv/cvExperienceService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError, ValidationError } from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvExperienceService.create", () => {
	// TEST 1 : création nominale
	it("creates a experience", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			start: new Date("2020-01-01"),
			company: "Company 1",
			missions: [],
			order: 1,
		});

		expect(experience.cvId).toBe(cv.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.order).toBe(1);
		expect(experience.start).toStrictEqual(new Date("2020-01-01"));
		expect(experience.end).toBeNull();
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvExperienceService.create("unknown-cv", {
				title: "Experience 1",
				company: "Company 1",
				missions: [],
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : experience déjà existante
	it("throws if experience already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			description: "Description 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			cvExperienceService.create(cv.id, {
				title: "Experience 1",
				description: "Description 1",
				company: "Company 1",
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
		await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			description: "Description 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			cvExperienceService.create(cv.id, {
				title: "Experience 2",
				description: "Description 2",
				location: "Location 2",
				company: "Company 2",
				missions: [],
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	// Test 5 : Experience en cours
	it("creates a experience in progress", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(experience.cvId).toBe(cv.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.order).toBe(1);
		expect(experience.start).toStrictEqual(new Date("2020-01-01"));
		expect(experience.end).toBeNull();
	});

	// Test 6 : Experience terminé
	it("creates a completed experience", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(experience.cvId).toBe(cv.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.order).toBe(1);
		expect(experience.start).toStrictEqual(new Date("2020-01-01"));
	});

	// Test 7 : start avant end
	it("throws if start date is before end date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(
			cvExperienceService.create(cv.id, {
				title: "Experience 1",
				company: "Company 1",
				missions: [],
				start: new Date("2020-01-01"),
				end: new Date("2019-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("CvExperienceService.findAllByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns experiences of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await cvExperienceService.create(cv.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await cvExperienceService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Experience 1");
		expect(result[1]!.title).toBe("Experience 2");
	});

	// TEST 2 : pas de experience existant
	it("returns empty array if no experience exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvExperienceService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de experience d'un autre CV
	it("does not return experiences from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvExperienceService.create(cvA.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvExperienceService.create(cvB.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const result = await cvExperienceService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Experience 1");
	});
});

describe("CvExperienceService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a Experience", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await cvExperienceService.update(experience.id, {
			company: "Company 2",
			missions: [],
		});

		expect(updated.company).toBe("Company 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : experience inexistant
	it("throws if experience does not exist", async () => {
		await expect(
			cvExperienceService.update("unknown-id", {
				company: "Company 2",
				missions: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : experience déjà existante
	it("throws if new experience already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const experience2 = await cvExperienceService.create(cv.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await expect(
			cvExperienceService.update(experience2.id, {
				title: "Experience 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates experience title", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await cvExperienceService.update(experience.id, {
			title: "Volunteering 2",
		});

		expect(updated.title).toBe("Volunteering 2");
	});

	// Test 6 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			cvExperienceService.update(experience.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 9 : end avant start mais en modifiant start
	it("throws if end date is before start date but start date is modified", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			cvExperienceService.update(experience.id, {
				start: new Date("2023-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("CvExperienceService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a experience to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience1 = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const experience2 = await cvExperienceService.create(cv.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvExperienceService.move(experience2.id, 1);
		const result = await cvExperienceService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(experience2.id);
		expect(result[1]!.id).toBe(experience1.id);
	});

	// TEST 2 : experience inexistant
	it("throws if experience does not exist", async () => {
		await expect(cvExperienceService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience1 = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(cvExperienceService.move(experience1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const experience = await cvExperienceService.create(cv.id, {
					title: "Experience 1",
					company: "Company 1",
					missions: [],
					start: new Date("2020-01-01"),
					order: 1,
				});
				return { id: experience.id, order: experience.order };
			},
			moveEntity: (id, order) => cvExperienceService.move(id, order),
		});
	});
});

describe("CvExperienceService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a experience", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const experience1 = await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvExperienceService.delete(experience1.id);
		const result = await cvExperienceService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : experience inexistant
	it("throws if experience does not exist", async () => {
		await expect(cvExperienceService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des experiences après suppression
	it("reorders remaining experiences after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvExperienceService.create(cv.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const experience2 = await cvExperienceService.create(cv.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvExperienceService.create(cv.id, {
			title: "Experience 3",
			company: "Company 3",
			missions: [],
			start: new Date("2020-01-01"),
			order: 3,
		});
		await cvExperienceService.delete(experience2.id);
		const result = await cvExperienceService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.title).toBe("Experience 3");
		expect(result[0]!.title).toBe("Experience 1");
	});
});
