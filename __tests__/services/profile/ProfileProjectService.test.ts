import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError, ValidationError } from "../../../src/services/errors";
import { CvTimelineStatus } from "../../../generated/prisma/enums";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileProjectService } from "../../../src/services/profile/profileProjectService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileProjectService.create", () => {
	// TEST 1 : création nominale
	it("creates a project", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Project 1",
			start: new Date("2020-01-01"),
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			order: 1,
		});

		expect(project.profileId).toBe(profile.id);
		expect(project.title).toBe("Project 1");
		expect(project.description).toBe("Description 1");
		expect(project.location).toBe("Location 1");
		expect(project.technology).toBe("Technology 1");
		expect(project.order).toBe(1);
		expect(project.start).toStrictEqual(new Date("2020-01-01"));
		expect(project.end).toBeNull();
		expect(project.status).toBeNull();
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileProjectService.create("unknown-profile", {
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
	it("throws if project already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileProjectService.create(profile.id, {
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
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			profileProjectService.create(profile.id, {
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(project.profileId).toBe(profile.id);
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		expect(project.profileId).toBe(profile.id);
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileProjectService.create(profile.id, {
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileProjectService.create(profile.id, {
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.ABANDONED,
			order: 1,
		});

		expect(project.profileId).toBe(profile.id);
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

describe("ProfileProjectService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns projects of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await profileProjectService.create(profile.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await profileProjectService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Project 1");
		expect(result[1]!.title).toBe("Project 2");
	});

	// TEST 2 : pas de project existant
	it("returns empty array if no project exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileProjectService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de project d'un autre Profile
	it("does not return projects from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "John", "Doe");
		await profileProjectService.create(profileA.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileProjectService.create(profileB.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const result = await profileProjectService.findAllByProfileId(profileA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Project 1");
	});
});

describe("ProfileProjectService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a Project", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Formation 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await profileProjectService.update(project.id, {
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
		});

		expect(updated.description).toBe("Description 2");
		expect(updated.location).toBe("Location 2");
		expect(updated.technology).toBe("Technology 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : project inexistant
	it("throws if project does not exist", async () => {
		await expect(
			profileProjectService.update("unknown-id", {
				description: "Description 2",
				location: "Location 2",
				technology: "Technology 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : project déjà existante
	it("throws if new project already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const project2 = await profileProjectService.create(profile.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await expect(
			profileProjectService.update(project2.id, {
				title: "Project 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates project title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "React Project",
			start: new Date("2020-01-01"),
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			order: 1,
		});
		const updated = await profileProjectService.update(project.id, {
			title: "Angular Project",
		});

		expect(updated.title).toBe("Angular Project");
	});

	// TEST 5 : conversion d'une project terminé en project en cours
	it("allows converting a completed project back to current", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		const updated = await profileProjectService.update(project.id, {
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
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
			profileProjectService.update(project.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 7 : update COMPLETED sans end date
	it("throws if completed status is provided without end date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
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
			profileProjectService.update(project.id, {
				status: CvTimelineStatus.COMPLETED,
				end: null as unknown as Date,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 8 : update project status
	it("updates project status", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const project = await profileProjectService.create(profile.id, {
			title: "Project 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			order: 1,
		});

		const updated = await profileProjectService.update(project.id, {
			status: CvTimelineStatus.COMPLETED,
		});

		expect(updated.status).toBe(CvTimelineStatus.COMPLETED);
	});

	// Test 9 : end avant start mais en modifiant start
	it("throws if end date is before start date but start date is modified", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project = await profileProjectService.create(profile.id, {
			title: "Formation 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			profileProjectService.update(project.id, {
				start: new Date("2023-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("ProfileProjectService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a project to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project1 = await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const project2 = await profileProjectService.create(profile.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileProjectService.move(project2.id, 1);
		const result = await profileProjectService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(project2.id);
		expect(result[1]!.id).toBe(project1.id);
	});

	// TEST 2 : project inexistant
	it("throws if project does not exist", async () => {
		await expect(profileProjectService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project1 = await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(profileProjectService.move(project1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const project = await profileProjectService.create(profile.id, {
					title: "Project 1",
					description: "Description 1",
					location: "Location 1",
					technology: "Technology 1",
					start: new Date("2020-01-01"),
					order: 1,
				});
				return { id: project.id, order: project.order };
			},
			moveEntity: (id, order) => profileProjectService.move(id, order),
		});
	});
});

describe("ProfileProjectService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a project", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const project1 = await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileProjectService.delete(project1.id);
		const result = await profileProjectService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : project inexistant
	it("throws if project does not exist", async () => {
		await expect(profileProjectService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des projects après suppression
	it("reorders remaining projects after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileProjectService.create(profile.id, {
			title: "Project 1",
			description: "Description 1",
			location: "Location 1",
			technology: "Technology 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const project2 = await profileProjectService.create(profile.id, {
			title: "Project 2",
			description: "Description 2",
			location: "Location 2",
			technology: "Technology 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileProjectService.create(profile.id, {
			title: "Project 3",
			description: "Description 3",
			location: "Location 3",
			technology: "Technology 3",
			start: new Date("2020-01-01"),
			order: 3,
		});
		await profileProjectService.delete(project2.id);
		const result = await profileProjectService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.technology).toBe("Technology 3");
		expect(result[0]!.title).toBe("Project 1");
		expect(result[1]!.title).toBe("Project 3");
	});
});
