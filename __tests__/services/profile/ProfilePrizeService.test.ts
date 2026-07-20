import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profilePrizeService } from "../../../src/services/profile/profilePrizeService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfilePrizeService.create", () => {
	// TEST 1 : création nominale
	it("creates a prize", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const prize = await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});

		expect(prize.profileId).toBe(profile.id);
		expect(prize.title).toBe("Prize 1");
		expect(prize.domaine).toBe("Domain 1");
		expect(prize.order).toBe(1);
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profilePrizeService.create("unknown-profile", {
				title: "Prize 1",
				domaine: "Domain 1",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : prize déjà existante
	it("throws if prize already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
		});
		await expect(
			profilePrizeService.create(profile.id, {
				title: "Prize 1",
				domaine: "Domain 2",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});

		await expect(
			profilePrizeService.create(profile.id, {
				title: "Prize 2",
				domaine: "Domain 2",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfilePrizeService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns prizes of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});

		await profilePrizeService.create(profile.id, {
			title: "Prize 2",
			domaine: "Domain 2",
			order: 2,
		});

		const result = await profilePrizeService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Prize 1");
		expect(result[1]!.title).toBe("Prize 2");
	});

	// TEST 2 : pas de prize existant
	it("returns empty array if no prize exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profilePrizeService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de prize d'un autre Profile
	it("does not return prizes from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "Jane", "Doe");
		await profilePrizeService.create(profileA.id, {
			title: "Prize 1",
			domaine: "Domain 1",
		});
		await profilePrizeService.create(profileB.id, {
			title: "Prize 2",
			domaine: "Domain 2",
		});
		const result = await profilePrizeService.findAllByProfileId(profileA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Prize 1");
	});
});

describe("ProfilePrizeService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a prize", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const prize = await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		const updated = await profilePrizeService.update(prize.id, {
			domaine: "Domain 2",
		});

		expect(updated.domaine).toBe("Domain 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : prize inexistant
	it("throws if prize does not exist", async () => {
		await expect(
			profilePrizeService.update("unknown-id", {
				domaine: "Domain 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : prize déjà existante
	it("throws if new prize already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		const prize2 = await profilePrizeService.create(profile.id, {
			title: "Prize 2",
			domaine: "Domain 2",
			order: 2,
		});
		await expect(
			profilePrizeService.update(prize2.id, {
				title: "Prize 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates prize title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const certification = await profilePrizeService.create(profile.id, {
			title: "React Prize",
			domaine: "Meta",
			order: 1,
		});
		const updated = await profilePrizeService.update(certification.id, {
			title: "Angular Prize",
		});

		expect(updated.title).toBe("Angular Prize");
	});
});

describe("ProfilePrizeService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a prize to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const prize1 = await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		const prize2 = await profilePrizeService.create(profile.id, {
			title: "Prize 2",
			domaine: "Domain 2",
			order: 2,
		});
		await profilePrizeService.move(prize2.id, 1);
		const result = await profilePrizeService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(prize2.id);
		expect(result[1]!.id).toBe(prize1.id);
	});

	// TEST 2 : prize inexistant
	it("throws if prize does not exist", async () => {
		await expect(profilePrizeService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const prize1 = await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		await expect(profilePrizeService.move(prize1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const prize = await profilePrizeService.create(profile.id, {
					title: "Prize 1",
					domaine: "Domain 1",
					order: 1,
				});
				return { id: prize.id, order: prize.order };
			},
			moveEntity: (id, order) => profilePrizeService.move(id, order),
		});
	});
});

describe("ProfilePrizeService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a prize", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const prize1 = await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		await profilePrizeService.delete(prize1.id);
		const result = await profilePrizeService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : prize inexistant
	it("throws if prize does not exist", async () => {
		await expect(profilePrizeService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : réorganisation des prizes après suppression
	it("reorders remaining prizes after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePrizeService.create(profile.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		const prize2 = await profilePrizeService.create(profile.id, {
			title: "Prize 2",
			domaine: "Domain 2",
			order: 2,
		});
		await profilePrizeService.create(profile.id, {
			title: "Prize 3",
			domaine: "Domain 3",
			order: 3,
		});
		await profilePrizeService.delete(prize2.id);
		const result = await profilePrizeService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.domaine).toBe("Domain 3");
		expect(result[0]!.title).toBe("Prize 1");
		expect(result[1]!.title).toBe("Prize 3");
	});
});
