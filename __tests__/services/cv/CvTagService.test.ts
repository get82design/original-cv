import { describe, expect, it } from "vitest";
import { cvTagGroupService } from "../../../src/services/cv/cvTagGroupService";
import { cvTagService } from "../../../src/services/cv/cvTagService";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { tagService } from "../../../src/services/commons/tagService";
import { createTestTemplate } from "../../utils/create-test-template";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvTagService.create", () => {
	it("creates a tag", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});

		const tag = await tagService.create({
			name: "Tag 1",
		});

		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		expect(cvTag.id).toBeDefined();
		expect(cvTag.tagId).toBe(tag.id);
		expect(cvTag.order).toBe(1);
	});

	it("throws if group does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(
			cvTagService.create("unknown-group", {
				tagId: "unknown-tag",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if tag does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await expect(
			cvTagService.create(tagGroup.id, {
				tagId: "unknown-tag",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if tag is already in group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			cvTagService.create(tagGroup.id, {
				tagId: tag.id,
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			cvTagService.create(tagGroup.id, {
				tagId: tag.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("creates another competence in same group with different order", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		await cvTagService.create(tagGroup.id, {
			tagId: tag2.id,
			order: 2,
		});
		const result = await cvTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(2);
		expect(result[0]!.tagId).toBe(tag.id);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.tagId).toBe(tag2.id);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			cvTagService.create(tagGroup.id, {
				tagId: tag.id,
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvTagService.findAllByGroupId", () => {
	it("returns tags of a group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const result = await cvTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.tagId).toBe(tag.id);
		expect(result[0]!.order).toBe(1);
	});

	it("returns empty array if no tag exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const result = await cvTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(0);
	});

	it("does not return tags from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const cv2 = await createCV(user.id, template.id);
		const tagGroup2 = await cvTagGroupService.create(cv2.id, {
			title: "Tag Group 2",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await cvTagService.create(tagGroup2.id, {
			tagId: tag.id,
			order: 1,
		});
		const result = await cvTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(0);
	});
});

describe("CvTagService.update", () => {
	it("updates a tag", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
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
		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const result = await cvTagService.update(cvTag.id, {
			tagId: tag2.id,
		});
		expect(result.id).toBe(cvTag.id);
		expect(result.tagId).toBe(tag2.id);
		expect(result.order).toBe(1);
	});

	it("updates referenced tag", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		const result = await cvTagService.update(cvTag.id, {
			tagId: tag2.id,
		});
		expect(result.id).toBe(cvTag.id);
		expect(result.tagId).toBe(tag2.id);
		expect(result.order).toBe(1);
	});

	it("throws if tag does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			cvTagService.update(cvTag.id, {
				tagId: "unknown-tag",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if referenced tag does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(
			cvTagService.update(cvTag.id, {
				tagId: "unknown-tag",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new tag already exists in group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		await cvTagService.create(tagGroup.id, {
			tagId: tag2.id,
			order: 2,
		});
		await expect(
			cvTagService.update(cvTag.id, {
				tagId: tag2.id,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvTagService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a tag to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup1 = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const cvTag = await cvTagService.create(tagGroup1.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		const cvTag2 = await cvTagService.create(tagGroup1.id, {
			tagId: tag2.id,
			order: 2,
		});
		await cvTagService.move(cvTag.id, 2);
		const result = await cvTagService.findAllByGroupId(tagGroup1.id);
		expect(result).toHaveLength(2);
		expect(result[0]!.tagId).toBe(tag2.id);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.tagId).toBe(tag.id);
		expect(result[1]!.order).toBe(2);
	});

	// TEST 2 : cvtag inexistant
	it("throws if cvtag does not exist", async () => {
		await expect(cvTagService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await expect(cvTagService.move(cvTag.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const newTag = await tagService.create({
			name: "Tag 1",
		});
		await expectMoveNoOp({
			createEntity: async () => {
				const tag = await cvTagService.create(tagGroup.id, {
					tagId: newTag.id,
					order: 1,
				});
				return { id: tag.id, order: tag.order };
			},
			moveEntity: (id, order) => cvTagService.move(id, order),
		});
	});
});

describe("CvTagService.delete", () => {
	it("deletes a tag", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await cvTagService.delete(cvTag.id);
		const result = await cvTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(0);
	});

	it("throws if tag does not exist", async () => {
		await expect(cvTagService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	it("reorders remaining tags", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const cvTag = await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		const tag2 = await tagService.create({
			name: "Tag 2",
		});
		const cvTag2 = await cvTagService.create(tagGroup.id, {
			tagId: tag2.id,
			order: 2,
		});
		await cvTagService.delete(cvTag.id);
		const result = await cvTagService.findAllByGroupId(tagGroup.id);
		expect(result).toHaveLength(1);
		expect(result[0]!.tagId).toBe(tag2.id);
		expect(result[0]!.order).toBe(1);
	});
});
