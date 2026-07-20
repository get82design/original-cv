import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { CvTimelineStatus } from "../../../generated/prisma/enums";
import { profileEducationService } from "../../../src/services/profile/profileEducationService";
import { createTestProfile } from "../../utils/create-test-profile";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileEducationService.create", () => {
	// TEST 1 : création nominale
	it("creates a education", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(education.profileId).toBe(profile.id);
		expect(education.title).toBe("Education 1");
		expect(education.school).toBe("School 1");
		expect(education.degree).toBe("Degree 1");
		expect(education.order).toBe(1);
		expect(education.start).toStrictEqual(new Date("2020-01-01"));
		expect(education.end).toBeNull();
		expect(education.obtained).toBeNull();
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileEducationService.create("unknown-profile", {
				title: "Education 1",
				school: "School 1",
				degree: "Degree 1",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : education déjà existante
	it("throws if education already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileEducationService.create(profile.id, {
				title: "Education 1",
				school: "School 2",
				degree: "Degree 2",
				start: new Date("2020-01-01"),
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			profileEducationService.create(profile.id, {
				title: "Education 2",
				school: "School 2",
				degree: "Degree 2",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	// Test 5 : Education en cours
	it("creates a education in progress", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(education.profileId).toBe(profile.id);
		expect(education.title).toBe("Education 1");
		expect(education.school).toBe("School 1");
		expect(education.degree).toBe("Degree 1");
		expect(education.order).toBe(1);
		expect(education.start).toStrictEqual(new Date("2020-01-01"));
		expect(education.end).toBeNull();
		expect(education.obtained).toBeNull();
	});

	// Test 6 : Education terminée
	it("creates a completed education", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		expect(education.profileId).toBe(profile.id);
		expect(education.title).toBe("Education 1");
		expect(education.school).toBe("School 1");
		expect(education.degree).toBe("Degree 1");
		expect(education.order).toBe(1);
		expect(education.start).toStrictEqual(new Date("2020-01-01"));
		expect(education.end).toStrictEqual(new Date("2022-06-30"));
		expect(education.obtained).toBe(CvTimelineStatus.COMPLETED);
	});

	// Test 7 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileEducationService.create(profile.id, {
				title: "Education 1",
				school: "School 1",
				degree: "Degree 1",
				start: new Date("2020-01-01"),
				end: new Date("2019-01-01"),
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 8 : COMPLETED sans end date
	it("throws if completed status is provided without end date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileEducationService.create(profile.id, {
				title: "Education 1",
				school: "School 1",
				degree: "Degree 1",
				start: new Date("2020-01-01"),
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 9 : Education abandonnée
	it("creates an abandoned education", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			obtained: CvTimelineStatus.ABANDONED,
			order: 1,
		});

		expect(education.profileId).toBe(profile.id);
		expect(education.title).toBe("Education 1");
		expect(education.school).toBe("School 1");
		expect(education.degree).toBe("Degree 1");
		expect(education.order).toBe(1);
		expect(education.start).toStrictEqual(new Date("2020-01-01"));
		expect(education.end).toStrictEqual(new Date("2022-06-30"));
		expect(education.obtained).toBe(CvTimelineStatus.ABANDONED);
	});
});

describe("ProfileEducationService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns educations of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await profileEducationService.create(profile.id, {
			title: "Education 2",
			school: "School 2",
			degree: "Degree 2",
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await profileEducationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Education 1");
		expect(result[1]!.title).toBe("Education 2");
	});

	// TEST 2 : pas de education existant
	it("returns empty array if no education exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileEducationService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de education d'un autre Profile
	it("does not return educations from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "Jane", "Doe");
		await profileEducationService.create(profileA.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileEducationService.create(profileB.id, {
			title: "Education 2",
			school: "School 2",
			degree: "Degree 2",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const result = await profileEducationService.findAllByProfileId(
			profileA.id,
		);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Education 1");
	});
});

describe("ProfileEducationService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a education", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await profileEducationService.update(education.id, {
			school: "School 2",
			degree: "Degree 2",
		});

		expect(updated.school).toBe("School 2");
		expect(updated.degree).toBe("Degree 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : education inexistant
	it("throws if education does not exist", async () => {
		await expect(
			profileEducationService.update("unknown-id", {
				school: "School 2",
				degree: "Degree 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : education déjà existante
	it("throws if new education already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const education2 = await profileEducationService.create(profile.id, {
			title: "Education 2",
			school: "School 2",
			degree: "Degree 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await expect(
			profileEducationService.update(education2.id, {
				title: "Education 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates education title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			start: new Date("2020-01-01"),
			school: "School 1",
			degree: "Degree 1",
			order: 1,
		});
		const updated = await profileEducationService.update(education.id, {
			title: "Education 2",
			school: "School 2",
			degree: "Degree 2",
		});

		expect(updated.title).toBe("Education 2");
		expect(updated.school).toBe("School 2");
		expect(updated.degree).toBe("Degree 2");
	});

	// TEST 5 : conversion d'une education terminée en education en cours
	it("allows converting a completed education back to current", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		const updated = await profileEducationService.update(education.id, {
			end: null,
			obtained: null,
		});
		expect(updated.obtained).toBeNull();
		expect(updated.end).toBeNull();
		expect(updated.start).toStrictEqual(new Date("2020-01-01"));
		expect(updated.school).toBe("School 1");
		expect(updated.degree).toBe("Degree 1");
		expect(updated.title).toBe("Education 1");
		expect(updated.order).toBe(1);
	});

	// Test 6 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await expect(
			profileEducationService.update(education.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 7 : update COMPLETED sans end date
	it("throws if completed status is provided without end date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await expect(
			profileEducationService.update(education.id, {
				obtained: CvTimelineStatus.COMPLETED,
				end: null,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 8 : update education obtained status
	it("updates education obtained status", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			order: 1,
		});

		const updated = await profileEducationService.update(education.id, {
			obtained: CvTimelineStatus.COMPLETED,
		});

		expect(updated.obtained).toBe(CvTimelineStatus.COMPLETED);
	});

	// Test 9 : end avant start mais en modifiant start
	it("throws if end date is before start date but start date is modified", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			profileEducationService.update(education.id, {
				start: new Date("2023-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("ProfileEducationService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a education to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education1 = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const education2 = await profileEducationService.create(profile.id, {
			title: "Education 2",
			school: "School 2",
			degree: "Degree 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileEducationService.move(education2.id, 1);
		const result = await profileEducationService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(education2.id);
		expect(result[1]!.id).toBe(education1.id);
	});

	// TEST 2 : education inexistant
	it("throws if education does not exist", async () => {
		await expect(profileEducationService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education1 = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileEducationService.move(education1.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const education = await profileEducationService.create(profile.id, {
					title: "Education 1",
					school: "School 1",
					degree: "Degree 1",
					start: new Date("2020-01-01"),
					order: 1,
				});
				return { id: education.id, order: education.order };
			},
			moveEntity: (id, order) => profileEducationService.move(id, order),
		});
	});
});

describe("ProfileEducationService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a education", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const education1 = await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileEducationService.delete(education1.id);
		const result = await profileEducationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : education inexistant
	it("throws if education does not exist", async () => {
		await expect(profileEducationService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : réorganisation des educations après suppression
	it("reorders remaining educations after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileEducationService.create(profile.id, {
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const education2 = await profileEducationService.create(profile.id, {
			title: "Education 2",
			school: "School 2",
			degree: "Degree 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileEducationService.create(profile.id, {
			title: "Education 3",
			school: "School 3",
			degree: "Degree 3",
			start: new Date("2020-01-01"),
			order: 3,
		});
		await profileEducationService.delete(education2.id);
		const result = await profileEducationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.school).toBe("School 3");
		expect(result[0]!.title).toBe("Education 1");
		expect(result[1]!.title).toBe("Education 3");
	});
});
