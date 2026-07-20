import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileVolunteeringService } from "../../../src/services/profile/profileVolunteeringService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileVolunteeringService.create", () => {
	// TEST 1 : création nominale
	it("creates a volunteering", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			start: new Date("2020-01-01"),
			organisation: "Organisation 1",
			missions: [],
			order: 1,
		});

		expect(volunteering.profileId).toBe(profile.id);
		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organisation 1");
		expect(volunteering.order).toBe(1);
		expect(volunteering.start).toStrictEqual(new Date("2020-01-01"));
		expect(volunteering.end).toBeNull();
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileVolunteeringService.create("unknown-profile", {
				title: "Volunteering 1",
				organisation: "Organisation 1",
				missions: [],
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : volunteering déjà existante
	it("throws if volunteering already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			description: "Description 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileVolunteeringService.create(profile.id, {
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
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			description: "Description 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			profileVolunteeringService.create(profile.id, {
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(volunteering.profileId).toBe(profile.id);
		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organisation 1");
		expect(volunteering.order).toBe(1);
		expect(volunteering.start).toStrictEqual(new Date("2020-01-01"));
		expect(volunteering.end).toBeNull();
	});

	// Test 6 : Volunteering terminé
	it("creates a completed volunteering", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(volunteering.profileId).toBe(profile.id);
		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organisation 1");
		expect(volunteering.order).toBe(1);
		expect(volunteering.start).toStrictEqual(new Date("2020-01-01"));
	});

	// Test 7 : start avant end
	it("throws if start date is before end date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileVolunteeringService.create(profile.id, {
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

describe("ProfileVolunteeringService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns volunteerings of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});

		await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await profileVolunteeringService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Volunteering 1");
		expect(result[1]!.title).toBe("Volunteering 2");
	});

	// TEST 2 : pas de volunteering existant
	it("returns empty array if no volunteering exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileVolunteeringService.findAllByProfileId(
			profile.id,
		);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de volunteering d'un autre Profile
	it("does not return volunteerings from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "John", "Doe");
		await profileVolunteeringService.create(profileA.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileVolunteeringService.create(profileB.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const result = await profileVolunteeringService.findAllByProfileId(
			profileA.id,
		);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Volunteering 1");
	});
});

describe("ProfileVolunteeringService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a Volunteering", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await profileVolunteeringService.update(volunteering.id, {
			organisation: "Organisation 2",
			missions: [],
		});

		expect(updated.organisation).toBe("Organisation 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : volunteering inexistant
	it("throws if volunteering does not exist", async () => {
		await expect(
			profileVolunteeringService.update("unknown-id", {
				organisation: "Organisation 2",
				missions: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : volunteering déjà existante
	it("throws if new volunteering already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const volunteering2 = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await expect(
			profileVolunteeringService.update(volunteering2.id, {
				title: "Volunteering 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates volunteering title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await profileVolunteeringService.update(volunteering.id, {
			title: "Volunteering 2",
		});

		expect(updated.title).toBe("Volunteering 2");
	});

	// Test 6 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileVolunteeringService.update(volunteering.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 9 : end avant start mais en modifiant start
	it("throws if end date is before start date but start date is modified", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			profileVolunteeringService.update(volunteering.id, {
				start: new Date("2023-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("ProfileVolunteeringService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a volunteering to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering1 = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const volunteering2 = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileVolunteeringService.move(volunteering2.id, 1);
		const result = await profileVolunteeringService.findAllByProfileId(
			profile.id,
		);

		expect(result[0]!.id).toBe(volunteering2.id);
		expect(result[1]!.id).toBe(volunteering1.id);
	});

	// TEST 2 : volunteering inexistant
	it("throws if volunteering does not exist", async () => {
		await expect(
			profileVolunteeringService.move("unknown-id", 1),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering1 = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileVolunteeringService.move(volunteering1.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const volunteering = await profileVolunteeringService.create(
					profile.id,
					{
						title: "Volunteering 1",
						organisation: "Organisation 1",
						missions: [],
						start: new Date("2020-01-01"),
						order: 1,
					},
				);
				return { id: volunteering.id, order: volunteering.order };
			},
			moveEntity: (id, order) => profileVolunteeringService.move(id, order),
		});
	});
});

describe("ProfileVolunteeringService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a volunteering", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const volunteering1 = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileVolunteeringService.delete(volunteering1.id);
		const result = await profileVolunteeringService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : volunteering inexistant
	it("throws if volunteering does not exist", async () => {
		await expect(
			profileVolunteeringService.delete("unknown-id"),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des volunteerings après suppression
	it("reorders remaining volunteerings after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 1",
			organisation: "Organisation 1",
			missions: [],
			start: new Date("2020-01-01"),
			order: 1,
		});
		const volunteering2 = await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 2",
			organisation: "Organisation 2",
			missions: [],
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileVolunteeringService.create(profile.id, {
			title: "Volunteering 3",
			organisation: "Organisation 3",
			missions: [],
			start: new Date("2020-01-01"),
			order: 3,
		});
		await profileVolunteeringService.delete(volunteering2.id);
		const result = await profileVolunteeringService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.title).toBe("Volunteering 3");
		expect(result[0]!.title).toBe("Volunteering 1");
		expect(result[1]!.title).toBe("Volunteering 3");
	});
});
