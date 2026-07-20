import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profilePassionService } from "../../../src/services/profile/profilePassionService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfilePassionService.create", () => {
	// TEST 1 : création d'une passion
	it("creates a passion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const passion = await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});

		expect(passion.profileId).toBe(profile.id);
		expect(passion.title).toBe("Voyage");
		expect(passion.icon).toBe("plane");
		expect(passion.order).toBe(1);
	});

	// TEST 2 : création d'une passion avec un Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profilePassionService.create("unknown-profile", {
				title: "Voyage",
				icon: "plane",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : création d'une passion avec un titre déjà existant pour le Profile
	it("throws if title already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await expect(
			profilePassionService.create(profile.id, {
				title: "Voyage",
				icon: "ship",
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : création d'une passion avec un ordre déjà existant pour le Profile
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await expect(
			profilePassionService.create(profile.id, {
				title: "Sport",
				icon: "ball",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfilePassionService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns passions for a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await profilePassionService.create(profile.id, {
			title: "Photographie",
			icon: "camera",
			order: 2,
		});
		const result = await profilePassionService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Voyage");
		expect(result[1]!.title).toBe("Photographie");
	});

	// TEST 2 : pas de passions
	it("returns empty array if Profile has no passions", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profilePassionService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});
});

describe("ProfilePassionService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a passion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const passion = await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		const updated = await profilePassionService.update(passion.id, {
			icon: "globe",
		});

		expect(updated.title).toBe("Voyage");
		expect(updated.icon).toBe("globe");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : mise à jour du titre
	it("updates passion title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const passion = await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		const updated = await profilePassionService.update(passion.id, {
			title: "Photographie",
		});

		expect(updated.title).toBe("Photographie");
	});

	// TEST 3 : mise à jour du titre déjà existant
	it("throws if title already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		const passion = await profilePassionService.create(profile.id, {
			title: "Sport",
			icon: "ball",
			order: 2,
		});
		await expect(
			profilePassionService.update(passion.id, {
				title: "Voyage",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : passion inexistante
	it("throws if passion does not exist", async () => {
		await expect(
			profilePassionService.update("unknown-id", {
				title: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("ProfilePassionService.move", () => {
	// TEST 1 : déplacement d'une passion
	it("moves a passion to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await profilePassionService.create(profile.id, {
			title: "Sport",
			icon: "ball",
			order: 2,
		});
		const reading = await profilePassionService.create(profile.id, {
			title: "Lecture",
			icon: "book",
			order: 3,
		});
		await profilePassionService.move(reading.id, 1);
		const result = await profilePassionService.findAllByProfileId(profile.id);

		expect(result[0]!.title).toBe("Lecture");
		expect(result[1]!.title).toBe("Voyage");
		expect(result[2]!.title).toBe("Sport");
	});

	// TEST 2 : passion inexistante
	it("throws if passion does not exist", async () => {
		await expect(profilePassionService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const passion = await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await expect(profilePassionService.move(passion.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const passion = await profilePassionService.create(profile.id, {
					title: "Voyage",
					icon: "plane",
					order: 1,
				});
				return { id: passion.id, order: passion.order };
			},
			moveEntity: (id, order) => profilePassionService.move(id, order),
		});
	});
});

describe("ProfilePassionService.delete", () => {
	// TEST 1 : suppression d'une passion
	it("deletes a passion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const passion = await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		await profilePassionService.delete(passion.id);
		const result = await profilePassionService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : passion inexistante
	it("throws if passion does not exist", async () => {
		await expect(profilePassionService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : reordonnancement des passions après suppression
	it("reorders remaining passions after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePassionService.create(profile.id, {
			title: "Voyage",
			icon: "plane",
			order: 1,
		});
		const sport = await profilePassionService.create(profile.id, {
			title: "Sport",
			icon: "ball",
			order: 2,
		});
		await profilePassionService.create(profile.id, {
			title: "Lecture",
			icon: "book",
			order: 3,
		});
		await profilePassionService.delete(sport.id);
		const result = await profilePassionService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Voyage");
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.title).toBe("Lecture");
		expect(result[1]!.order).toBe(2);
	});
});
