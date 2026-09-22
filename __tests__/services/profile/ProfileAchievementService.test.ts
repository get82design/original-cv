import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileAchievementService } from "../../../src/services/profile/profileAchievementService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileAchievementService.create", () => {
	// TEST 1 : création nominale
	it("creates an achievement", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const achievement = await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});

		expect(achievement.profileId).toBe(profile.id);
		expect(achievement.title).toBe("Achievement 1");
		expect(achievement.description).toBe("Description 1");
		expect(achievement.year).toBe(2020);
		expect(achievement.technology).toBe("Technology 1");
		expect(achievement.order).toBe(1);
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileAchievementService.create("unknown-profile", {
				title: "Achievement 1",
				description: "Description 1",
				year: 2020,
				technology: "Technology 1",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : achievement déjà existante
	it("throws if achievement already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		await expect(
			profileAchievementService.create(profile.id, {
				title: "Achievement 1",
				description: "Description 2",
				year: 2020,
				technology: "Technology 2",
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});

		await expect(
			profileAchievementService.create(profile.id, {
				title: "Achievement 2",
				description: "Description 2",
				year: 2020,
				technology: "Technology 2",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileAchievementService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns achievements of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});

		await profileAchievementService.create(profile.id, {
			title: "Achievement 2",
			description: "Description 2",
			year: 2020,
			technology: "Technology 2",
			order: 2,
		});

		const result = await profileAchievementService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Achievement 1");
		expect(result[1]!.title).toBe("Achievement 2");
	});

	// TEST 2 : pas d'achievement existant
	it("returns empty array if no achievement exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileAchievementService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas d'achievement d'un autre Profile
	it("does not return achievements from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "Jane", "Doe");
		await profileAchievementService.create(profileA.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		await profileAchievementService.create(profileB.id, {
			title: "Achievement 2",
			description: "Description 2",
			year: 2020,
			technology: "Technology 2",
			order: 2,
		});
		const result = await profileAchievementService.findAllByProfileId(profileA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Achievement 1");
	});
});

describe("ProfileAchievementService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates an achievement", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const achievement = await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		const updated = await profileAchievementService.update(achievement.id, {
			description: "Description 2",
			year: 2020,
			technology: "Technology 2",
		});

		expect(updated.description).toBe("Description 2");
		expect(updated.year).toBe(2020);
		expect(updated.technology).toBe("Technology 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : achievement inexistant
	it("throws if achievement does not exist", async () => {
		await expect(
			profileAchievementService.update("unknown-id", {
				description: "Description 2",
				year: 2020,
				technology: "Technology 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : achievement déjà existante
	it("throws if new achievement already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		const achievement2 = await profileAchievementService.create(profile.id, {
			title: "Achievement 2",
			description: "Description 2",
			year: 2020,
			technology: "Technology 2",
			order: 2,
		});
		await expect(
			profileAchievementService.update(achievement2.id, {
				title: "Achievement 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates achievement title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const achievement = await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		const updated = await profileAchievementService.update(achievement.id, {
			title: "Achievement 2",
		});

		expect(updated.title).toBe("Achievement 2");
	});
});

describe("ProfileAchievementService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves an achievement to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const achievement1 = await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		const achievement2 = await profileAchievementService.create(profile.id, {
			title: "Achievement 2",
			description: "Description 2",
			year: 2020,
			technology: "Technology 2",
			order: 2,
		});
		await profileAchievementService.move(achievement2.id, 1);
		const result = await profileAchievementService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(achievement2.id);
		expect(result[1]!.id).toBe(achievement1.id);
	});

	// TEST 2 : achievement inexistant
	it("throws if achievement does not exist", async () => {
		await expect(profileAchievementService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const achievement1 = await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		await expect(profileAchievementService.move(achievement1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const achievement = await profileAchievementService.create(profile.id, {
					title: "Achievement 1",
					description: "Description 1",
					year: 2020,
					technology: "Technology 1",
					order: 1,
				});
				return { id: achievement.id, order: achievement.order };
			},
			moveEntity: (id, order) => profileAchievementService.move(id, order),
		});
	});
});

describe("ProfileAchievementService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes an achievement", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const achievement1 = await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		await profileAchievementService.delete(achievement1.id);
		const result = await profileAchievementService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : achievement inexistant
	it("throws if achievement does not exist", async () => {
		await expect(profileAchievementService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des achievements après suppression
	it("reorders remaining achievements after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileAchievementService.create(profile.id, {
			title: "Achievement 1",
			description: "Description 1",
			year: 2020,
			technology: "Technology 1",
			order: 1,
		});
		const achievement2 = await profileAchievementService.create(profile.id, {
			title: "Achievement 2",
			description: "Description 2",
			year: 2020,
			technology: "Technology 2",
			order: 2,
		});
		await profileAchievementService.create(profile.id, {
			title: "Achievement 3",
			description: "Description 3",
			year: 2020,
			technology: "Technology 3",
			order: 3,
		});
		await profileAchievementService.delete(achievement2.id);
		const result = await profileAchievementService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.technology).toBe("Technology 3");
		expect(result[0]!.title).toBe("Achievement 1");
		expect(result[1]!.title).toBe("Achievement 3");
	});
});
