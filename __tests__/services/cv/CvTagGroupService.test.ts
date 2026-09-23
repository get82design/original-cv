import { describe, expect, it } from "vitest";
import { cvTagGroupService } from "../../../src/services/cv/cvTagGroupService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvTagService } from "../../../src/services/cv/cvTagService";
import { prismaTest } from "../../../lib/prismaTest";
import { tagService } from "../../../src/services/commons/tagService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvTagGroupService.create", () => {
	it("creates a tag group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		expect(tagGroup.title).toBe("Tag Group 1");
		expect(tagGroup.order).toBe(1);
	});

	it("throws if CV does not exist", async () => {
		await expect(
			cvTagGroupService.create("unknown-cv", {
				title: "Tag Group 1",
				order: 1,
				tags: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await expect(
			cvTagGroupService.create(cv.id, {
				title: "Tag Group 1",
				order: 2,
				tags: [],
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await expect(
			cvTagGroupService.create(cv.id, {
				title: "Tag Group 2",
				order: 1,
				tags: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvTagGroupService.findAllByCvId", () => {
	it("finds all tag groups by CV ID", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await cvTagGroupService.create(cv.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		const tagGroups = await cvTagGroupService.findAllByCvId(cv.id);
		expect(tagGroups.length).toBe(2);
		expect(tagGroups[0]?.title).toBe("Tag Group 1");
		expect(tagGroups[0]?.order).toBe(1);
		expect(tagGroups[1]?.title).toBe("Tag Group 2");
		expect(tagGroups[1]?.order).toBe(2);
	});

	it("returns empty array if no tag groups exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroups = await cvTagGroupService.findAllByCvId(cv.id);
		expect(tagGroups).toEqual([]);
	});

	it("return only tag groups for the given CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const cv2 = await createCV(user.id, template.id);
		await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await cvTagGroupService.create(cv2.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		const tagGroups = await cvTagGroupService.findAllByCvId(cv.id);
		expect(tagGroups.length).toBe(1);
		expect(tagGroups[0]?.title).toBe("Tag Group 1");
		expect(tagGroups[0]?.order).toBe(1);
	});
});

describe("CvTagGroupService.update", () => {
	it("updates a tag group by ID", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const updatedTagGroup = await cvTagGroupService.update(tagGroup.id, {
			title: "Tag Group 2",
			tags: [],
		});
		expect(updatedTagGroup.title).toBe("Tag Group 2");
		expect(updatedTagGroup.order).toBe(1);
	});

	it("throws if tag group does not exist", async () => {
		await expect(
			cvTagGroupService.update("unknown-tag-group", {
				title: "Tag Group 2",
				tags: [],
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if title is already used", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await cvTagGroupService.create(cv.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		await expect(
			cvTagGroupService.update(tagGroup.id, {
				title: "Tag Group 2",
				tags: [],
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvTagGroupService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a tag group to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup1 = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tagGroup2 = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		await cvTagGroupService.move(tagGroup2.id, 1);
		const result = await cvTagGroupService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(tagGroup2.id);
		expect(result[1]!.id).toBe(tagGroup1.id);
	});

	// TEST 2 : tag group inexistant
	it("throws if tag group does not exist", async () => {
		await expect(cvTagGroupService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
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
		await expect(cvTagGroupService.move(tagGroup.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const tagGroup = await cvTagGroupService.create(cv.id, {
					title: "Tag Group 1",
					order: 1,
					tags: [],
				});
				return { id: tagGroup.id, order: tagGroup.order };
			},
			moveEntity: (id, order) => cvTagGroupService.move(id, order),
		});
	});
});

describe("CvTagGroupService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a tag group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await cvTagGroupService.delete(tagGroup.id);
		const result = await cvTagGroupService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : tag group inexistant
	it("throws if tag group does not exist", async () => {
		await expect(cvTagGroupService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des tag groups après suppression
	it("reorders remaining tag groups after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		await cvTagGroupService.create(cv.id, {
			title: "Tag Group 2",
			order: 2,
			tags: [],
		});
		await cvTagGroupService.delete(tagGroup.id);
		const result = await cvTagGroupService.findAllByCvId(cv.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.order).toBe(1);
		expect(result[0]!.title).toBe("Tag Group 2");
	});

	it("deletes related cvTags when deleting group", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const tagGroup = await cvTagGroupService.create(cv.id, {
			title: "Tag Group 1",
			order: 1,
			tags: [],
		});
		const tag = await tagService.create({ name: "Tag 1" });
		await cvTagService.create(tagGroup.id, {
			tagId: tag.id,
			order: 1,
		});
		await cvTagGroupService.delete(tagGroup.id);
		// CvSkill supprimés
		const cvTags = await prismaTest.cvTag.findMany({
			where: { groupId: tagGroup.id },
		});
		expect(cvTags).toHaveLength(0);
		// Tag catalogue conservé
		const tags = await tagService.findAll();
		expect(tags).toHaveLength(1);
		expect(tags[0]!.id).toBe(tag.id);
	});
});
