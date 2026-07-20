import { describe, expect, it } from "vitest";
import { cvPublicationService } from "../../../src/services/cv/cvPublicationService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvPublicationService.create", () => {
	// TEST 1 : création nominale
	it("creates a publication", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const publication = await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			start: new Date("2020-01-01"),
			journalName: "Journal 1",
			order: 1,
		});

		expect(publication.cvId).toBe(cv.id);
		expect(publication.title).toBe("Publication 1");
		expect(publication.journalName).toBe("Journal 1");
		expect(publication.order).toBe(1);
		expect(publication.start).toStrictEqual(new Date("2020-01-01"));
		expect(publication.end).toBeNull();
		expect(publication.url).toBeNull();
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvPublicationService.create("unknown-cv", {
				title: "Publication 1",
				journalName: "Journal 1",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : publication déjà existante
	it("throws if publication already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			cvPublicationService.create(cv.id, {
				title: "Publication 1",
				journalName: "Journal 2",
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
		await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			cvPublicationService.create(cv.id, {
				title: "Publication 2",
				journalName: "Journal 2",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	// Test 7 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(
			cvPublicationService.create(cv.id, {
				title: "Publication 1",
				journalName: "Journal 1",
				start: new Date("2020-01-01"),
				end: new Date("2019-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("CvPublicationService.findAllByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns publications of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			start: new Date("2020-01-01"),
			journalName: "Journal 1",
			order: 1,
		});

		await cvPublicationService.create(cv.id, {
			title: "Publication 2",
			journalName: "Journal 2",
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await cvPublicationService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Publication 1");
		expect(result[1]!.title).toBe("Publication 2");
	});

	// TEST 2 : pas de publication existant
	it("returns empty array if no publication exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvPublicationService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de publication d'un autre CV
	it("does not return publications from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvPublicationService.create(cvA.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvPublicationService.create(cvB.id, {
			title: "Publication 2",
			start: new Date("2020-01-01"),
			journalName: "Journal 2",
			order: 1,
		});
		const result = await cvPublicationService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Publication 1");
	});
});

describe("CvPublicationService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a publication", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const publication = await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await cvPublicationService.update(publication.id, {
			journalName: "Journal 2",
		});

		expect(updated.journalName).toBe("Journal 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : publication inexistant
	it("throws if publication does not exist", async () => {
		await expect(
			cvPublicationService.update("unknown-id", {
				journalName: "Journal 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : publication déjà existante
	it("throws if new publication already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const publication2 = await cvPublicationService.create(cv.id, {
			title: "Publication 2",
			start: new Date("2020-01-01"),
			journalName: "Journal 2",
			order: 2,
		});
		await expect(
			cvPublicationService.update(publication2.id, {
				title: "Publication 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates publication title", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const publication = await cvPublicationService.create(cv.id, {
			title: "React Publication",
			start: new Date("2020-01-01"),
			journalName: "Journal 1",
			order: 1,
		});
		const updated = await cvPublicationService.update(publication.id, {
			title: "Angular Publication",
		});

		expect(updated.title).toBe("Angular Publication");
	});

	// Test 5 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const publication = await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			cvPublicationService.update(publication.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("CvPublicationService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a publication to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const publication1 = await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const publication2 = await cvPublicationService.create(cv.id, {
			title: "Publication 2",
			journalName: "Journal 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvPublicationService.move(publication2.id, 1);
		const result = await cvPublicationService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(publication2.id);
		expect(result[1]!.id).toBe(publication1.id);
	});

	// TEST 2 : publication inexistant
	it("throws if publication does not exist", async () => {
		await expect(cvPublicationService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const publication1 = await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			cvPublicationService.move(publication1.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const publication = await cvPublicationService.create(cv.id, {
					title: "Publication 1",
					start: new Date("2020-01-01"),
					order: 1,
				});
				return { id: publication.id, order: publication.order };
			},
			moveEntity: (id, order) => cvPublicationService.move(id, order),
		});
	});
});

describe("CvPublicationService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a publication", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const publication1 = await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvPublicationService.delete(publication1.id);
		const result = await cvPublicationService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : publication inexistant
	it("throws if publication does not exist", async () => {
		await expect(cvPublicationService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : réorganisation des publications après suppression
	it("reorders remaining publications after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPublicationService.create(cv.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const publication2 = await cvPublicationService.create(cv.id, {
			title: "Publication 2",
			journalName: "Journal 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvPublicationService.create(cv.id, {
			title: "Publication 3",
			journalName: "Journal 3",
			start: new Date("2020-01-01"),
			order: 3,
		});
		await cvPublicationService.delete(publication2.id);
		const result = await cvPublicationService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.journalName).toBe("Journal 3");
		expect(result[0]!.title).toBe("Publication 1");
		expect(result[1]!.title).toBe("Publication 3");
	});
});
