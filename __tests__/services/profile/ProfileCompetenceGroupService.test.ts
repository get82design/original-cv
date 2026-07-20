import { describe, expect, it } from "vitest";
import { profileCompetenceGroupService } from "../../../src/services/profile/profileCompetenceGroupService";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { prismaTest } from "../../../lib/prismaTest";
import { competenceService } from "../../../src/services/cv/competenceService";
import { profileCompetenceService } from "../../../src/services/profile/profileCompetenceService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileCompetenceGroupService.create", () => {
	it("creates a competence group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		expect(competenceGroup.title).toBe("Competence Group 1");
		expect(competenceGroup.order).toBe(1);
	});

	it("throws if profile does not exist", async () => {
		await expect(
			profileCompetenceGroupService.create("unknown-profile", {
				title: "Competence Group 1",
				order: 1,
				competences: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileCompetenceGroupService.create(profile.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await expect(
			profileCompetenceGroupService.create(profile.id, {
				title: "Competence Group 1",
				order: 2,
				competences: [],
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileCompetenceGroupService.create(profile.id, {
			title: "Competence Group 1",
			order: 1,
			competences: [],
		});
		await expect(
			profileCompetenceGroupService.create(profile.id, {
				title: "Competence Group 2",
				order: 1,
				competences: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileCompetenceGroupService.findAllByProfileId", () => {
	it("finds all competence groups by profile ID", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		const competenceGroup2 = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 2",
				order: 2,
				competences: [],
			},
		);
		const competenceGroups =
			await profileCompetenceGroupService.findAllByProfileId(profile.id);
		expect(competenceGroups.length).toBe(2);
		expect(competenceGroups[0]?.title).toBe("Competence Group 1");
		expect(competenceGroups[0]?.order).toBe(1);
		expect(competenceGroups[1]?.title).toBe("Competence Group 2");
		expect(competenceGroups[1]?.order).toBe(2);
	});

	it("returns empty array if no competence groups exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroups =
			await profileCompetenceGroupService.findAllByProfileId(profile.id);
		expect(competenceGroups).toEqual([]);
	});

	it("return only competence groups for the given profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const profile2 = await createTestProfile(user2.id, "John2", "Doe2");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		await profileCompetenceGroupService.create(profile2.id, {
			title: "Competence Group 2",
			order: 2,
			competences: [],
		});
		const competenceGroups =
			await profileCompetenceGroupService.findAllByProfileId(profile.id);
		expect(competenceGroups.length).toBe(1);
		expect(competenceGroups[0]?.title).toBe("Competence Group 1");
		expect(competenceGroups[0]?.order).toBe(1);
	});
});

describe("ProfileCompetenceGroupService.update", () => {
	it("updates a competence group by ID", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		const updatedCompetenceGroup = await profileCompetenceGroupService.update(
			competenceGroup.id,
			{
				title: "Competence Group 2",
				competences: [],
			},
		);
		expect(updatedCompetenceGroup.title).toBe("Competence Group 2");
		expect(updatedCompetenceGroup.order).toBe(1);
	});

	it("throws if competence group does not exist", async () => {
		await expect(
			profileCompetenceGroupService.update("unknown-competence-group", {
				title: "Competence Group 2",
				competences: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		await profileCompetenceGroupService.create(profile.id, {
			title: "Competence Group 2",
			order: 2,
			competences: [],
		});
		await expect(
			profileCompetenceGroupService.update(competenceGroup.id, {
				title: "Competence Group 2",
				competences: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileCompetenceGroupService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a competence group to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup1 = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		const competenceGroup2 = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 2",
				order: 2,
				competences: [],
			},
		);
		await profileCompetenceGroupService.move(competenceGroup2.id, 1);
		const result = await profileCompetenceGroupService.findAllByProfileId(
			profile.id,
		);

		expect(result[0]!.id).toBe(competenceGroup2.id);
		expect(result[1]!.id).toBe(competenceGroup1.id);
	});

	// TEST 2 : competence group inexistant
	it("throws if competence group does not exist", async () => {
		await expect(
			profileCompetenceGroupService.move("unknown-competence-group", 1),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		await expect(
			profileCompetenceGroupService.move(competenceGroup.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const competenceGroup = await profileCompetenceGroupService.create(
					profile.id,
					{
						title: "Competence Group 1",
						order: 1,
						competences: [],
					},
				);
				return { id: competenceGroup.id, order: competenceGroup.order };
			},
			moveEntity: (id, order) => profileCompetenceGroupService.move(id, order),
		});
	});
});

describe("ProfileCompetenceGroupService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a competence group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		await profileCompetenceGroupService.delete(competenceGroup.id);
		const result = await profileCompetenceGroupService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : competence group inexistant
	it("throws if competence group does not exist", async () => {
		await expect(
			profileCompetenceGroupService.delete("unknown-competence-group"),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des competence groups après suppression
	it("reorders remaining competence groups after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		const competenceGroup2 = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 2",
				order: 2,
				competences: [],
			},
		);
		await profileCompetenceGroupService.delete(competenceGroup.id);
		const result = await profileCompetenceGroupService.findAllByProfileId(
			profile.id,
		);

		expect(result).toHaveLength(1);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.title).toBe("Competence Group 2");
	});

	it("deletes related profileCompetences when deleting group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		const competence = await competenceService.create({ name: "Competence 1" });
		await profileCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await profileCompetenceGroupService.delete(competenceGroup.id);
		// Competences supprimés
		const profileCompetences = await prismaTest.profileCompetence.findMany({
			where: { groupId: competenceGroup.id },
		});
		expect(profileCompetences).toHaveLength(0);
		// Competences catalogue conservé
		const competences = await competenceService.findAll();
		expect(competences).toHaveLength(1);
		expect(competences[0]!.id).toBe(competence.id);
	});
});
