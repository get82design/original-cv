import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError, ValidationError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profilePublicationService } from "../../../src/services/profile/profilePublicationService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfilePublicationService.create", () => {
	// TEST 1 : création nominale
	it("creates a publication", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const publication = await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			start: new Date("2020-01-01"),
			journalName: "Journal 1",
			order: 1,
		});

		expect(publication.profileId).toBe(profile.id);
		expect(publication.title).toBe("Publication 1");
		expect(publication.journalName).toBe("Journal 1");
		expect(publication.order).toBe(1);
		expect(publication.start).toStrictEqual(new Date("2020-01-01"));
		expect(publication.end).toBeNull();
		expect(publication.url).toBeNull();
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profilePublicationService.create("unknown-profile", {
				title: "Publication 1",
				journalName: "Journal 1",
				start: new Date("2020-01-01"),
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : publication déjà existante
	it("throws if publication already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(
			profilePublicationService.create(profile.id, {
				title: "Publication 1",
				journalName: "Journal 2",
				start: new Date("2020-01-01"),
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});

		await expect(
			profilePublicationService.create(profile.id, {
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
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profilePublicationService.create(profile.id, {
				title: "Publication 1",
				journalName: "Journal 1",
				start: new Date("2020-01-01"),
				end: new Date("2019-01-01"),
				order: 1,
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("ProfilePublicationService.findAllByProfileId", () => {
	// TEST 1 : recherche par Profile
	it("returns publications of a Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			start: new Date("2020-01-01"),
			journalName: "Journal 1",
			order: 1,
		});

		await profilePublicationService.create(profile.id, {
			title: "Publication 2",
			journalName: "Journal 2",
			start: new Date("2020-01-01"),
			order: 2,
		});

		const result = await profilePublicationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Publication 1");
		expect(result[1]!.title).toBe("Publication 2");
	});

	// TEST 2 : pas de publication existant
	it("returns empty array if no publication exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profilePublicationService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de publication d'un autre Profile
	it("does not return publications from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "Jane", "Doe");
		await profilePublicationService.create(profileA.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profilePublicationService.create(profileB.id, {
			title: "Publication 2",
			start: new Date("2020-01-01"),
			journalName: "Journal 2",
			order: 1,
		});
		const result = await profilePublicationService.findAllByProfileId(profileA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Publication 1");
	});
});

describe("ProfilePublicationService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a publication", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const publication = await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const updated = await profilePublicationService.update(publication.id, {
			journalName: "Journal 2",
		});

		expect(updated.journalName).toBe("Journal 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : publication inexistant
	it("throws if publication does not exist", async () => {
		await expect(
			profilePublicationService.update("unknown-id", {
				journalName: "Journal 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : publication déjà existante
	it("throws if new publication already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const publication2 = await profilePublicationService.create(profile.id, {
			title: "Publication 2",
			start: new Date("2020-01-01"),
			journalName: "Journal 2",
			order: 2,
		});
		await expect(
			profilePublicationService.update(publication2.id, {
				title: "Publication 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates publication title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const publication = await profilePublicationService.create(profile.id, {
			title: "React Publication",
			start: new Date("2020-01-01"),
			journalName: "Journal 1",
			order: 1,
		});
		const updated = await profilePublicationService.update(publication.id, {
			title: "Angular Publication",
		});

		expect(updated.title).toBe("Angular Publication");
	});

	// Test 5 : end avant start
	it("throws if end date is before start date", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const publication = await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			end: new Date("2021-01-01"),
			order: 1,
		});
		await expect(
			profilePublicationService.update(publication.id, {
				end: new Date("2019-01-01"),
			}),
		).rejects.toThrow(ValidationError);
	});
});

describe("ProfilePublicationService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a publication to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const publication1 = await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const publication2 = await profilePublicationService.create(profile.id, {
			title: "Publication 2",
			journalName: "Journal 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profilePublicationService.move(publication2.id, 1);
		const result = await profilePublicationService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(publication2.id);
		expect(result[1]!.id).toBe(publication1.id);
	});

	// TEST 2 : publication inexistant
	it("throws if publication does not exist", async () => {
		await expect(profilePublicationService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const publication1 = await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await expect(profilePublicationService.move(publication1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const publication = await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		return await expectMoveNoOp({
			createEntity: async () => {
				return { id: publication.id, order: publication.order };
			},
			moveEntity: (id, order) => profilePublicationService.move(id, order),
		});
	});
});

describe("ProfilePublicationService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a publication", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const publication1 = await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		await profilePublicationService.delete(publication1.id);
		const result = await profilePublicationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : publication inexistant
	it("throws if publication does not exist", async () => {
		await expect(profilePublicationService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des publications après suppression
	it("reorders remaining publications after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profilePublicationService.create(profile.id, {
			title: "Publication 1",
			journalName: "Journal 1",
			start: new Date("2020-01-01"),
			order: 1,
		});
		const publication2 = await profilePublicationService.create(profile.id, {
			title: "Publication 2",
			journalName: "Journal 2",
			start: new Date("2020-01-01"),
			order: 2,
		});
		await profilePublicationService.create(profile.id, {
			title: "Publication 3",
			journalName: "Journal 3",
			start: new Date("2020-01-01"),
			order: 3,
		});
		await profilePublicationService.delete(publication2.id);
		const result = await profilePublicationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.journalName).toBe("Journal 3");
		expect(result[0]!.title).toBe("Publication 1");
		expect(result[1]!.title).toBe("Publication 3");
	});
});
