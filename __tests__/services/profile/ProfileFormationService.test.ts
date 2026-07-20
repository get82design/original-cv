import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import {
	ConflictError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { CvTimelineStatus } from "../../../generated/prisma/enums";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileFormationService } from "../../../src/services/profile/profileFormationService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileFormationService.create", () => {
	// TEST 1 : création nominale
	it("creates a formation", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			start: new Date("2020-01-01"),
			organismeFormation: "Organisme 1",
			order: 1,
		});

		expect(formation.profileId).toBe(profile.id);
		expect(formation.title).toBe("Formation 1");
		expect(formation.organismeFormation).toBe("Organisme 1");
		expect(formation.order).toBe(1);
		expect(formation.start).toStrictEqual(new Date("2020-01-01"));
		expect(formation.end).toBeNull();
		expect(formation.status).toBeNull();
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileFormationService.create("unknown-profile", {
				title: "Formation 1",
				organismeFormation: "Organisme 1",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : formation déjà existante
	it("throws if formation already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileFormationService.create(profile.id, {
				title: "Formation 1",
				organismeFormation: "Organisme 2",
				start: new Date("2020-01-01"),
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			profileFormationService.create(profile.id, {
				title: "Formation 2",
				organismeFormation: "Organisme 2",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	// Test 5 : Formation en cours
	it("creates a formation in progress", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		expect(formation.profileId).toBe(profile.id);
		expect(formation.title).toBe("Formation 1");
		expect(formation.organismeFormation).toBe("Organisme 1");
		expect(formation.order).toBe(1);
		expect(formation.start).toStrictEqual(new Date("2020-01-01"));
		expect(formation.end).toBeNull();
		expect(formation.status).toBeNull();
	});

	// Test 6 : Formation terminée
	it("creates a completed formation", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		expect(formation.profileId).toBe(profile.id);
		expect(formation.title).toBe("Formation 1");
		expect(formation.organismeFormation).toBe("Organisme 1");
		expect(formation.order).toBe(1);
		expect(formation.start).toStrictEqual(new Date("2020-01-01"));
		expect(formation.end).toStrictEqual(new Date("2022-06-30"));
		expect(formation.status).toBe(CvTimelineStatus.COMPLETED);
	});

	// Test 7 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileFormationService.create(profile.id, {
				title: "Formation 1",
				organismeFormation: "Organisme 1",
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
			profileFormationService.create(profile.id, {
				title: "Formation 1",
				organismeFormation: "Organisme 1",
				start: new Date("2020-01-01"),
				status: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 9 : Formation abandonnée
	it("creates an abandoned formation", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.ABANDONED,
			order: 1,
		});

		expect(formation.profileId).toBe(profile.id);
		expect(formation.title).toBe("Formation 1");
		expect(formation.organismeFormation).toBe("Organisme 1");
		expect(formation.order).toBe(1);
		expect(formation.start).toStrictEqual(new Date("2020-01-01"));
		expect(formation.end).toStrictEqual(new Date("2022-06-30"));
		expect(formation.status).toBe(CvTimelineStatus.ABANDONED);
	});
});

describe("ProfileFormationService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns formations of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileFormationService.create(profile.id, {
			title: "Formation 1",
			start: new Date("2020-01-01"),
			organismeFormation: "Organisme 1",
			order: 1,
		});

		await profileFormationService.create(profile.id, {
			title: "Formation 2",
			organismeFormation: "Organisme 2",
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await profileFormationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Formation 1");
		expect(result[1]!.title).toBe("Formation 2");
	});

	// TEST 2 : pas de formation existant
	it("returns empty array if no formation exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileFormationService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de formation d'un autre Profile
	it("does not return formations from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "John", "Doe");
		await profileFormationService.create(profileA.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileFormationService.create(profileB.id, {
			title: "Formation 2",
			start: new Date("2020-01-01"),
			organismeFormation: "Organisme 2",
			order: 1,
		});
		const result = await profileFormationService.findAllByProfileId(
			profileA.id,
		);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Formation 1");
	});
});

describe("ProfileFormationService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a formation", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await profileFormationService.update(formation.id, {
			organismeFormation: "Organisme 2",
		});

		expect(updated.organismeFormation).toBe("Organisme 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : formation inexistant
	it("throws if formation does not exist", async () => {
		await expect(
			profileFormationService.update("unknown-id", {
				organismeFormation: "Organisme 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : formation déjà existante
	it("throws if new formation already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const formation2 = await profileFormationService.create(profile.id, {
			title: "Formation 2",
			start: new Date("2020-01-01"),
			organismeFormation: "Organisme 2",
			order: 2,
		});
		await expect(
			profileFormationService.update(formation2.id, {
				title: "Formation 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates formation title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "React Formation",
			start: new Date("2020-01-01"),
			organismeFormation: "Meta",
			order: 1,
		});
		const updated = await profileFormationService.update(formation.id, {
			title: "Angular Formation",
		});

		expect(updated.title).toBe("Angular Formation");
	});

	// TEST 5 : conversion d'une formation terminée en formation en cours
	it("allows converting a completed formation back to current", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		const updated = await profileFormationService.update(formation.id, {
			status: null,
			end: null,
		});
		expect(updated.status).toBeNull();
		expect(updated.end).toBeNull();
		expect(updated.start).toStrictEqual(new Date("2020-01-01"));
		expect(updated.organismeFormation).toBe("Organisme 1");
		expect(updated.title).toBe("Formation 1");
		expect(updated.order).toBe(1);
	});

	// Test 6 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await expect(
			profileFormationService.update(formation.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 7 : update COMPLETED sans end date
	it("throws if completed status is provided without end date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			status: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await expect(
			profileFormationService.update(formation.id, {
				status: CvTimelineStatus.COMPLETED,
				end: null,
			}),
		).rejects.toThrow(ValidationError);
	});

	// Test 8 : update formation status
	it("updates formation status", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");

		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			start: new Date("2020-01-01"),
			end: new Date("2022-06-30"),
			order: 1,
		});

		const updated = await profileFormationService.update(formation.id, {
			status: CvTimelineStatus.COMPLETED,
		});

		expect(updated.status).toBe(CvTimelineStatus.COMPLETED);
	});

	// Test 9 : end avant start mais en modifiant start
	it("throws if end date is before start date but start date is modified", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			profileFormationService.update(formation.id, {
				start: new Date("2023-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("ProfileFormationService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a formation to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation1 = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const formation2 = await profileFormationService.create(profile.id, {
			title: "Formation 2",
			organismeFormation: "Organisme 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileFormationService.move(formation2.id, 1);
		const result = await profileFormationService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(formation2.id);
		expect(result[1]!.id).toBe(formation1.id);
	});

	// TEST 2 : formation inexistant
	it("throws if formation does not exist", async () => {
		await expect(profileFormationService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation1 = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profileFormationService.move(formation1.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const formation = await profileFormationService.create(profile.id, {
					title: "Formation 1",
					organismeFormation: "Organisme 1",
					start: new Date("2020-01-01"),
					order: 1,
				});
				return { id: formation.id, order: formation.order };
			},
			moveEntity: (id, order) => profileFormationService.move(id, order),
		});
	});
});

describe("ProfileFormationService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a formation", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const formation1 = await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profileFormationService.delete(formation1.id);
		const result = await profileFormationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : formation inexistant
	it("throws if formation does not exist", async () => {
		await expect(profileFormationService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : réorganisation des formations après suppression
	it("reorders remaining formations after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileFormationService.create(profile.id, {
			title: "Formation 1",
			organismeFormation: "Organisme 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const formation2 = await profileFormationService.create(profile.id, {
			title: "Formation 2",
			organismeFormation: "Organisme 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profileFormationService.create(profile.id, {
			title: "Formation 3",
			organismeFormation: "Organisme 3",
			start: new Date("2020-01-01"),
			order: 3,
		});
		await profileFormationService.delete(formation2.id);
		const result = await profileFormationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.organismeFormation).toBe("Organisme 3");
		expect(result[0]!.title).toBe("Formation 1");
		expect(result[1]!.title).toBe("Formation 3");
	});
});
