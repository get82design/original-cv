import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileExperienceService } from "../../../src/services/profile/profileExperienceService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileExperienceService.create", () => {
	// TEST 1 : création nominale
	it("creates a experience", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			start: new Date("2020-01-01"),
			company: "Company 1",
			missions: [],
			order: 1,
		});

		expect(experience.profileId).toBe(profile.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.order).toBe(1);
		expect(experience.start).toStrictEqual(new Date("2020-01-01"));
		expect(experience.end).toBeNull();
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileExperienceService.create("unknown-profile", {
				title: "Experience 1",
				company: "Company 1",
				missions: [],
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : experience déjà existante
	it("throws if experience already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			description: "Description 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileExperienceService.create(profile.id, {
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
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			description: "Description 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			profileExperienceService.create(profile.id, {
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(experience.profileId).toBe(profile.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.order).toBe(1);
		expect(experience.start).toStrictEqual(new Date("2020-01-01"));
		expect(experience.end).toBeNull();
	});

	// Test 6 : Experience terminé
	it("creates a completed experience", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(experience.profileId).toBe(profile.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.order).toBe(1);
		expect(experience.start).toStrictEqual(new Date("2020-01-01"));
	});

	// Test 7 : start avant end
	it("throws if start date is before end date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileExperienceService.create(profile.id, {
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

describe("ProfileExperienceService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns experiences of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await profileExperienceService.create(profile.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await profileExperienceService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Experience 1");
		expect(result[1]!.title).toBe("Experience 2");
	});

	// TEST 2 : pas de experience existant
	it("returns empty array if no experience exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileExperienceService.findAllByProfileId(
			profile.id,
		);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de experience d'un autre Profile
	it("does not return experiences from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "John", "Doe");
		await profileExperienceService.create(profileA.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileExperienceService.create(profileB.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const result = await profileExperienceService.findAllByProfileId(
			profileA.id,
		);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Experience 1");
	});
});

describe("ProfileExperienceService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a Experience", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await profileExperienceService.update(experience.id, {
			company: "Company 2",
			missions: [],
		});

		expect(updated.company).toBe("Company 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : experience inexistant
	it("throws if experience does not exist", async () => {
		await expect(
			profileExperienceService.update("unknown-id", {
				company: "Company 2",
				missions: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : experience déjà existante
	it("throws if new experience already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const experience2 = await profileExperienceService.create(profile.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await expect(
			profileExperienceService.update(experience2.id, {
				title: "Experience 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates experience title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await profileExperienceService.update(experience.id, {
			title: "Volunteering 2",
		});

		expect(updated.title).toBe("Volunteering 2");
	});

	// Test 6 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileExperienceService.update(experience.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 9 : end avant start mais en modifiant start
	it("throws if end date is before start date but start date is modified", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			profileExperienceService.update(experience.id, {
				start: new Date("2023-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("ProfileExperienceService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a experience to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience1 = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const experience2 = await profileExperienceService.create(profile.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileExperienceService.move(experience2.id, 1);
		const result = await profileExperienceService.findAllByProfileId(
			profile.id,
		);

		expect(result[0]!.id).toBe(experience2.id);
		expect(result[1]!.id).toBe(experience1.id);
	});

	// TEST 2 : experience inexistant
	it("throws if experience does not exist", async () => {
		await expect(
			profileExperienceService.move("unknown-id", 1),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience1 = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileExperienceService.move(experience1.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const experience = await profileExperienceService.create(profile.id, {
					title: "Experience 1",
					company: "Company 1",
					missions: [],
					start: new Date("2020-01-01"),
					order: 1,
				});
				return { id: experience.id, order: experience.order };
			},
			moveEntity: (id, order) => profileExperienceService.move(id, order),
		});
	});
});

describe("ProfileExperienceService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a experience", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const experience1 = await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileExperienceService.delete(experience1.id);
		const result = await profileExperienceService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : experience inexistant
	it("throws if experience does not exist", async () => {
		await expect(profileExperienceService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : réorganisation des experiences après suppression
	it("reorders remaining experiences after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileExperienceService.create(profile.id, {
			title: "Experience 1",
			company: "Company 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const experience2 = await profileExperienceService.create(profile.id, {
			title: "Experience 2",
			company: "Company 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileExperienceService.create(profile.id, {
			title: "Experience 3",
			company: "Company 3",
			missions: [],
			start: new Date("2020-01-01"),
			order: 3,
		});
		await profileExperienceService.delete(experience2.id);
		const result = await profileExperienceService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.title).toBe("Experience 3");
		expect(result[0]!.title).toBe("Experience 1");
	});
});
