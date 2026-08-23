import { describe, expect, it } from "vitest";
import { profileTagGroupService } from "../../../src/services/profile/profileTagGroupService";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { prismaTest } from "../../../lib/prismaTest";
import { tagService } from "../../../src/services/commons/tagService";
import { profileTagService } from "../../../src/services/profile/profileTagService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileTagGroupService.create", () => {
	it("creates a tag group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		expect(tagGroup.title).toBe("Tag Group 1");
		expect(tagGroup.order).toBe(1);
	});

	it("throws if profile does not exist", async () => {
		await expect(
			profileTagGroupService.create("unknown-profile", {
				title: "Tag Group 1",
				order: 1,
				tags: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await expect(
			profileTagGroupService.create(profile.id, {
				title: "Tag Group 1",
				order: 2,
				tags: [],
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await expect(
			profileTagGroupService.create(profile.id, {
				title: "Tag Group 2",
				order: 1,
				tags: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileTagGroupService.findAllByProfileId", () => {
	it("finds all tag groups by profile ID", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tagGroup2 = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		const tagGroups = await profileTagGroupService.findAllByProfileId(
			profile.id,
		);
		expect(tagGroups.length).toBe(2);
		expect(tagGroups[0]?.title).toBe("Tag Group 1");
		expect(tagGroups[0]?.order).toBe(1);
		expect(tagGroups[1]?.title).toBe("Tag Group 2");
		expect(tagGroups[1]?.order).toBe(2);
	});

	it("returns empty array if no tag groups exist", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroups = await profileTagGroupService.findAllByProfileId(
			profile.id,
		);
		expect(tagGroups).toEqual([]);
	});

	it("return only tag groups for the given profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const profile2 = await createTestProfile(user2.id, "John2", "Doe2");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await profileTagGroupService.create(profile2.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		const tagGroups = await profileTagGroupService.findAllByProfileId(
			profile.id,
		);
		expect(tagGroups.length).toBe(1);
		expect(tagGroups[0]?.title).toBe("Tag Group 1");
		expect(tagGroups[0]?.order).toBe(1);
	});
});

describe("ProfileTagGroupService.update", () => {
	it("updates a tag group by ID", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const updatedTagGroup = await profileTagGroupService.update(tagGroup.id, {
			title: "Tag Group 2",
			tags: [],
		});
		expect(updatedTagGroup.title).toBe("Tag Group 2");
		expect(updatedTagGroup.order).toBe(1);
	});

	it("throws if tag group does not exist", async () => {
		await expect(
			profileTagGroupService.update("unknown-tag-group", {
				title: "Tag Group 2",
				tags: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await profileTagGroupService.create(profile.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		await expect(
			profileTagGroupService.update(tagGroup.id, {
				title: "Tag Group 2",
				tags: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileTagGroupService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a competence group to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup1 = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tagGroup2 = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		await profileTagGroupService.move(tagGroup2.id, 1);
		const result = await profileTagGroupService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(tagGroup2.id);
		expect(result[1]!.id).toBe(tagGroup1.id);
	});

	// TEST 2 : tag group inexistant
	it("throws if tag group does not exist", async () => {
		await expect(
			profileTagGroupService.move("unknown-tag-group", 1),
		).rejects.toThrow(NotFoundError);
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
		await expect(profileTagGroupService.move(tagGroup.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const tagGroup = await profileTagGroupService.create(profile.id, {
					title: "Tag Group 1",
					order: 1,
					tags: [],
				});
				return { id: tagGroup.id, order: tagGroup.order };
			},
			moveEntity: (id, order) => profileTagGroupService.move(id, order),
		});
	});
});

describe("ProfileTagGroupService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a tag group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await profileTagGroupService.delete(tagGroup.id);
		const result = await profileTagGroupService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : tag group inexistant
	it("throws if tag group does not exist", async () => {
		await expect(
			profileTagGroupService.delete("unknown-tag-group"),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des tag groups après suppression
	it("reorders remaining tag groups after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tagGroup2 = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		await profileTagGroupService.delete(tagGroup.id);
		const result = await profileTagGroupService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.title).toBe("Tag Group 2");
	});

	it("deletes related profileTags when deleting group", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const tagGroup = await profileTagGroupService.create(profile.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({ name: "Tag 1" });
		await profileTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await profileTagGroupService.delete(tagGroup.id);
		// Competences supprimés
		const profileTags = await prismaTest.profileTag.findMany({
			where: { groupId: tagGroup.id },
		});
		expect(profileTags).toHaveLength(0);
		// Competences catalogue conservé
		const tags = await tagService.findAll();
		expect(tags).toHaveLength(1);
		expect(tags[0]!.id).toBe(tag.id);
	});
});
