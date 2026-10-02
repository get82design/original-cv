import { describe, expect, it } from "vitest";
import { cvProjectService } from "../../../src/services/cv/cvProjectService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError, ValidationError } from "../../../src/services/errors";
import { CvTimelineStatus } from "../../../generated/prisma/enums";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvProjectService.create", () => {
	// TEST 1 : création nominale
	it("creates a project", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Project 1",
			start: new Date("2020-01-01"),
			description: "Description 1",
			result: "Résultat 1",
			location: "Location 1",
			technology: "Technology 1",
			order: 1,
		});

		expect(project.cvId).toBe(cv.id);
		expect(project.title).toBe("Project 1");
		expect(project.description).toBe("Description 1");
		expect(project.result).toBe("Résultat 1");
		expect(project.location).toBe("Location 1");
		expect(project.technology).toBe("Technology 1");
		expect(project.order).toBe(1);
		expect(project.start).toStrictEqual(new Date("2020-01-01"));
		expect(project.end).toBeNull();
		expect(project.status).toBeNull();
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvProjectService.create("unknown-cv", {
				title: "Project 1",
				description: "Description 1",
				location: "Location 1",
				technology: "Technology 1",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : project déjà existante
	it("throws if project already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			cvProjectService.create(cv.id, {
				title: "Project 1",
				description: "Description 1",
				location: "Location 1",
				technology: "Technology 1",
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
		await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			cvProjectService.create(cv.id, {
				title: "Project 2",
				description: "Description 2",
				location: "Location 2",
				technology: "Technology 2",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	// Test 5 : Project en cours
	it("creates a project in progress", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(project.cvId).toBe(cv.id);
		expect(project.title).toBe("Project 1");
		expect(project.description).toBe("Description 1");
		expect(project.location).toBe("Location 1");
		expect(project.technology).toBe("Technology 1");
		expect(project.order).toBe(1);
		expect(project.start).toStrictEqual(new Date("2020-01-01"));
		expect(project.end).toBeNull();
		expect(project.status).toBeNull();
	});

	// Test 6 : Project terminé
	it("creates a completed project", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		expect(project.cvId).toBe(cv.id);
		expect(project.title).toBe("Project 1");
		expect(project.description).toBe("Description 1");
		expect(project.location).toBe("Location 1");
		expect(project.technology).toBe("Technology 1");
		expect(project.order).toBe(1);
		expect(project.start).toStrictEqual(new Date("2020-01-01"));
		expect(project.end).toStrictEqual(new Date("2022-06-30"));
		expect(project.status).toBe(CvTimelineStatus.COMPLETED);
	});

	// Test 7 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(
			cvProjectService.create(cv.id, {
				title: "Project 1",
				description: "Description 1",
				location: "Location 1",
				technology: "Technology 1",
				start: new Date("2020-01-01"),
				end: new Date("2019-01-01"),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 8 : COMPLETED sans end date
	it("throws if completed status is provided without end date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(
			cvProjectService.create(cv.id, {
				title: "Project 1",
				description: "Description 1",
				location: "Location 1",
				technology: "Technology 1",
				start: new Date("2020-01-01"),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 9 : Project abandonné
	it("creates an abandoned project", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.ABANDONED,
			order: 1,
		});

		expect(project.cvId).toBe(cv.id);
		expect(project.title).toBe("Project 1");
		expect(project.description).toBe("Description 1");
		expect(project.location).toBe("Location 1");
		expect(project.technology).toBe("Technology 1");
		expect(project.order).toBe(1);
		expect(project.start).toStrictEqual(new Date("2020-01-01"));
		expect(project.end).toStrictEqual(new Date("2022-06-30"));
		expect(project.status).toBe(CvTimelineStatus.ABANDONED);
	});
});

describe("CvProjectService.findAllByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns projects of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await cvProjectService.create(cv.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await cvProjectService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Project 1");
		expect(result[1]!.title).toBe("Project 2");
	});

	// TEST 2 : pas de project existant
	it("returns empty array if no project exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvProjectService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de project d'un autre CV
	it("does not return projects from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvProjectService.create(cvA.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvProjectService.create(cvB.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const result = await cvProjectService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Project 1");
	});
});

describe("CvProjectService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a Project", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Formation 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await cvProjectService.update(project.id, {
			description: "Description 2",
			result: "Résultat 2",
			location: "Location 2",
			technology: "Technology 2",
		});

		expect(updated.description).toBe("Description 2");
		expect(updated.result).toBe("Résultat 2");
		expect(updated.location).toBe("Location 2");
		expect(updated.technology).toBe("Technology 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : project inexistant
	it("throws if project does not exist", async () => {
		await expect(
			cvProjectService.update("unknown-id", {
				description: "Description 2",
				location: "Location 2",
				technology: "Technology 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : project déjà existante
	it("throws if new project already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const project2 = await cvProjectService.create(cv.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await expect(
			cvProjectService.update(project2.id, {
				title: "Project 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates project title", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "React Project",
			start: new Date("2020-01-01"),
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			order: 1,
		});
		const updated = await cvProjectService.update(project.id, {
			title: "Angular Project",
		});

		expect(updated.title).toBe("Angular Project");
	});

	// TEST 5 : conversion d'une project terminé en project en cours
	it("allows converting a completed project back to current", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		const updated = await cvProjectService.update(project.id, {
			status: null,
			end: null as unknown as Date,
		});
		expect(updated.status).toBeNull();
		expect(updated.end).toBeNull();
		expect(updated.start).toStrictEqual(new Date("2020-01-01"));
		expect(updated.technology).toBe("Technology 1");
		expect(updated.title).toBe("Project 1");
		expect(updated.order).toBe(1);
	});

	// Test 6 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await expect(
			cvProjectService.update(project.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 7 : update COMPLETED sans end date
	it("throws if completed status is provided without end date", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Formation 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await expect(
			cvProjectService.update(project.id, {
				status: CvTimelineStatus.COMPLETED,
				end: null as unknown as Date,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 8 : update project status
	it("updates project status", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const project = await cvProjectService.create(cv.id, {
			title: "Project 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			order: 1,
		});

		const updated = await cvProjectService.update(project.id, {
			status: CvTimelineStatus.COMPLETED,
		});

		expect(updated.status).toBe(CvTimelineStatus.COMPLETED);
	});

	// Test 9 : end avant start mais en modifiant start
	it("throws if end date is before start date but start date is modified", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project = await cvProjectService.create(cv.id, {
			title: "Formation 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			cvProjectService.update(project.id, {
				start: new Date("2023-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("CvProjectService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a project to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project1 = await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const project2 = await cvProjectService.create(cv.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvProjectService.move(project2.id, 1);
		const result = await cvProjectService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(project2.id);
		expect(result[1]!.id).toBe(project1.id);
	});

	// TEST 2 : project inexistant
	it("throws if project does not exist", async () => {
		await expect(cvProjectService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project1 = await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(cvProjectService.move(project1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const project = await cvProjectService.create(cv.id, {
					title: "Project 1",
					start: new Date("2020-01-01"),
					order: 1,
				});
				return { id: project.id, order: project.order };
			},
			moveEntity: (id, order) => cvProjectService.move(id, order),
		});
	});
});

describe("CvProjectService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a project", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const project1 = await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await cvProjectService.delete(project1.id);
		const result = await cvProjectService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : project inexistant
	it("throws if project does not exist", async () => {
		await expect(cvProjectService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des projects après suppression
	it("reorders remaining projects after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvProjectService.create(cv.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const project2 = await cvProjectService.create(cv.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await cvProjectService.create(cv.id, {
			title: "Project 3",
			description: "Description 3",
			location: "Location 3",
			technology: "Technology 3",
			start: new Date("2020-01-01"),
			order: 3,
		});
		await cvProjectService.delete(project2.id);
		const result = await cvProjectService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.technology).toBe("Technology 3");
		expect(result[0]!.title).toBe("Project 1");
		expect(result[1]!.title).toBe("Project 3");
	});
});
