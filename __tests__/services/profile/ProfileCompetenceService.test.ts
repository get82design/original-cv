import { describe, expect, it } from "vitest";
import { profileCompetenceGroupService } from "../../../src/services/profile/profileCompetenceGroupService";
import { profileCompetenceService } from "../../../src/services/profile/profileCompetenceService";
import { competenceService } from "../../../src/services/commons/competenceService";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileCompetenceService.create", () => {
	it("creates a competence", async () => {
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

		const competence = await competenceService.create({
			name: "Competence 1",
		});

		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		expect(profileCompetence.id).toBeDefined();
		expect(profileCompetence.competenceId).toBe(competence.id);
		expect(profileCompetence.order).toBe(1);
	});

	it("throws if group does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileCompetenceService.create(profile.id, {
				competenceId: "unknown-competence",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if competence does not exist", async () => {
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
			profileCompetenceService.create(competenceGroup.id, {
				competenceId: "unknown-competence",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if competence is already in group", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await profileCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(
			profileCompetenceService.create(competenceGroup.id, {
				competenceId: competence.id,
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await profileCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(
			profileCompetenceService.create(competenceGroup.id, {
				competenceId: competence.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("creates another competence in same group with different order", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await profileCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		await profileCompetenceService.create(competenceGroup.id, {
			competenceId: competence2.id,
			order: 2,
		});
		const result = await profileCompetenceService.findAllByGroupId(
			competenceGroup.id,
		);
		expect(result).toHaveLength(2);
		expect(result[0]!.competenceId).toBe(competence.id);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.competenceId).toBe(competence2.id);
	});

	it("throws if order is already used", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await profileCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		await expect(
			profileCompetenceService.create(competenceGroup.id, {
				competenceId: competence.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileCompetenceService.findAllByGroupId", () => {
	it("returns competences of a group", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await profileCompetenceService.create(competenceGroup.id, {
			competenceId: competence.id,
			order: 1,
		});
		const result = await profileCompetenceService.findAllByGroupId(
			competenceGroup.id,
		);
		expect(result).toHaveLength(1);
		expect(result[0]!.competenceId).toBe(competence.id);
		expect(result[0]!.order).toBe(1);
	});

	it("returns empty array if no competence exists", async () => {
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
		const result = await profileCompetenceService.findAllByGroupId(
			competenceGroup.id,
		);
		expect(result).toHaveLength(0);
	});

	it("does not return competences from another profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const competenceGroup = await profileCompetenceGroupService.create(
			profile.id,
			{
				title: "Competence Group 1",
				order: 1,
				competences: [],
			},
		);
		const profile2 = await createTestProfile(user2.id, "John2", "Doe2");
		const competenceGroup2 = await profileCompetenceGroupService.create(
			profile2.id,
			{
				title: "Competence Group 2",
				order: 1,
				competences: [],
			},
		);
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		await profileCompetenceService.create(competenceGroup2.id, {
			competenceId: competence.id,
			order: 1,
		});
		const result = await profileCompetenceService.findAllByGroupId(
			competenceGroup.id,
		);
		expect(result).toHaveLength(0);
	});
});

describe("ProfileCompetenceService.update", () => {
	it("updates a competence", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		const result = await profileCompetenceService.update(profileCompetence.id, {
			competenceId: competence2.id,
		});
		expect(result.id).toBe(profileCompetence.id);
		expect(result.competenceId).toBe(competence2.id);
		expect(result.order).toBe(1);
	});

	it("updates referenced competence", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		const result = await profileCompetenceService.update(profileCompetence.id, {
			competenceId: competence2.id,
		});
		expect(result.id).toBe(profileCompetence.id);
		expect(result.competenceId).toBe(competence2.id);
		expect(result.order).toBe(1);
	});

	it("throws if competence does not exist", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		await expect(
			profileCompetenceService.update(profileCompetence.id, {
				competenceId: "unknown-competence",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if referenced competence does not exist", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		await expect(
			profileCompetenceService.update(profileCompetence.id, {
				competenceId: "unknown-competence",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new competence already exists in group", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		await profileCompetenceService.create(competenceGroup.id, {
			competenceId: competence2.id,
			order: 2,
		});
		await expect(
			profileCompetenceService.update(profileCompetence.id, {
				competenceId: competence2.id,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileCompetenceService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a competence to another position", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup1.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		const profileCompetence2 = await profileCompetenceService.create(
			competenceGroup1.id,
			{
				competenceId: competence2.id,
				order: 2,
			},
		);
		await profileCompetenceService.move(profileCompetence.id, 2);
		const result = await profileCompetenceService.findAllByGroupId(
			competenceGroup1.id,
		);
		expect(result).toHaveLength(2);
		expect(result[0]!.competenceId).toBe(competence2.id);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.competenceId).toBe(competence.id);
		expect(result[1]!.order).toBe(2);
	});

	// TEST 2 : profilecompetence inexistant
	it("throws if competence does not exist", async () => {
		await expect(
			profileCompetenceService.move("unknown-id", 1),
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		await expect(
			profileCompetenceService.move(profileCompetence.id, 0),
		).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		return await expectMoveNoOp({
			createEntity: async () => {
				return { id: profileCompetence.id, order: profileCompetence.order };
			},
			moveEntity: (id, order) => profileCompetenceService.move(id, order),
		});
	});
});

describe("ProfileCompetenceService.delete", () => {
	it("deletes a competence", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		await profileCompetenceService.delete(profileCompetence.id);
		const result = await profileCompetenceService.findAllByGroupId(
			competenceGroup.id,
		);
		expect(result).toHaveLength(0);
	});

	it("throws if competence does not exist", async () => {
		await expect(profileCompetenceService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("reorders remaining competences", async () => {
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
		const competence = await competenceService.create({
			name: "Competence 1",
		});
		const profileCompetence = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence.id,
				order: 1,
			},
		);
		const competence2 = await competenceService.create({
			name: "Competence 2",
		});
		const profileCompetence2 = await profileCompetenceService.create(
			competenceGroup.id,
			{
				competenceId: competence2.id,
				order: 2,
			},
		);
		await profileCompetenceService.delete(profileCompetence.id);
		const result = await profileCompetenceService.findAllByGroupId(
			competenceGroup.id,
		);
		expect(result).toHaveLength(1);
		expect(result[0]!.competenceId).toBe(competence2.id);
		expect(result[0]!.order).toBe(1);
	});
});
