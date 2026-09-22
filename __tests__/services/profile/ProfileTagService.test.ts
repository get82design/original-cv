import { describe, expect, it } from "vitest";
import { profileTagGroupService } from "../../../src/services/profile/profileTagGroupService";
import { profileTagService } from "../../../src/services/profile/profileTagService";
import { tagService } from "../../../src/services/commons/tagService";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileTagService.create", () => {
	it("creates a tag", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});

		const tag = await tagService.create({
			name: "Tag 1",
		});

		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		expect(profileTag.id).toBeDefined();
		expect(profileTag.tagId).toBe(tag.id);
		expect(profileTag.order).toBe(1);
	});

	it("throws if group does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expect(
			profileTagService.create(profile.id, {
				tagId: "unknown-tag",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if tag does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await expect(
			profileTagService.create(tagGroup.id, {
				tagId: "unknown-tag",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if competence is already in group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			profileTagService.create(tagGroup.id, {
				tagId: tag.id,
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			profileTagService.create(tagGroup.id, {
				tagId: tag.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("creates another tag in same group with different order", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		await profileTagService.create(tagGroup.id, {
			tagId: tag2.id,
			order: 2,
		});
		const result = await profileTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(2);
		expect(result[0]!.tagId).toBe(tag.id);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.tagId).toBe(tag2.id);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			profileTagService.create(tagGroup.id, {
				tagId: tag.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileTagService.findAllByGroupId", () => {
	it("returns tags of a group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const result = await profileTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.tagId).toBe(tag.id);
		expect(result[0]!.order).toBe(1);
	});

	it("returns empty array if no tag exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const result = await profileTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(0);
	});

	it("does not return tags from another profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const profile2 = await createTestProfile(user2.id, "John2", "Doe2");
		const tagGroup2 = await profileTagGroupService.create(profile2.id, {
			title: "Tag Group 2",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await profileTagService.create(tagGroup2.id, {
			tagId: tag.id,
			order: 1,
		});
		const result = await profileTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(0);
	});
});

describe("ProfileTagService.update", () => {
	it("updates a tag", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const result = await profileTagService.update(profileTag.id, {
			tagId: tag2.id,
		});
		expect(result.id).toBe(profileTag.id);
		expect(result.tagId).toBe(tag2.id);
		expect(result.order).toBe(1);
	});

	it("updates referenced tag", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		const result = await profileTagService.update(profileTag.id, {
			tagId: tag2.id,
		});
		expect(result.id).toBe(profileTag.id);
		expect(result.tagId).toBe(tag2.id);
		expect(result.order).toBe(1);
	});

	it("throws if competence does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			profileTagService.update(profileTag.id, {
				tagId: "unknown-tag",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if referenced tag does not exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			profileTagService.update(profileTag.id, {
				tagId: "unknown-tag",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new tag already exists in group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		await profileTagService.create(tagGroup.id, {
			tagId: tag2.id,
			order: 2,
		});
		await expect(
			profileTagService.update(profileTag.id, {
				tagId: tag2.id,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileTagService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a tag to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup1 = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup1.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		const profileTag2 = await profileTagService.create(tagGroup1.id, {
			tagId: tag2.id,
			order: 2,
		});
		await profileTagService.move(profileTag.id, 2);
		const result = await profileTagService.findAllByGroupId(tagGroup1.id);
		expect(result).toHaveLength(2);
		expect(result[0]!.tagId).toBe(tag2.id);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.tagId).toBe(tag.id);
		expect(result[1]!.order).toBe(2);
	});

	// TEST 2 : profiletag inexistant
	it("throws if tag does not exist", async () => {
		await expect(profileTagService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(profileTagService.move(profileTag.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		return await expectMoveNoOp({
			createEntity: async () => {
				return { id: profileTag.id, order: profileTag.order };
			},
			moveEntity: (id, order) => profileTagService.move(id, order),
		});
	});
});

describe("ProfileTagService.delete", () => {
	it("deletes a tag", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await profileTagService.delete(profileTag.id);
		const result = await profileTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(0);
	});

	it("throws if tag does not exist", async () => {
		await expect(profileTagService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	it("reorders remaining tags", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const profileTag = await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		const profileTag2 = await profileTagService.create(tagGroup.id, {
			tagId: tag2.id,
			order: 2,
		});
		await profileTagService.delete(profileTag.id);
		const result = await profileTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.tagId).toBe(tag2.id);
		expect(result[0]!.order).toBe(1);
	});
});
