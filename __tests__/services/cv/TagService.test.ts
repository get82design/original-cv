import { describe, expect, it } from "vitest";
import { tagService } from "../../../src/services/commons/tagService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvService } from "../../../src/services/cv/cvService";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { cvTagService } from "../../../src/services/cv/cvTagService";
import { cvTagGroupService } from "../../../src/services/cv/cvTagGroupService";

describe("TagService.create", () => {
	it("creates a tag", async () => {
		const tag = await tagService.create({
			name: "Tag 1",
		});
		expect(tag.name).toBe("tag 1");
	});

	it("returns existing tag if it already exists", async () => {
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const existingTag = await tagService.create({
			name: "Tag 1",
		});
		expect(existingTag.id).toBe(tag.id);
	});

	it("trims and lowercases tag name", async () => {
		const tag = await tagService.create({
			name: " React ",
		});

		expect(tag.name).toBe("react");
	});
});

describe("TagService.findAll", () => {
	it("returns all skills sorted by name", async () => {
		await tagService.create({
			name: "Tag 1",
		});
		await tagService.create({
			name: "Tag 2",
		});
		await tagService.create({
			name: "Tag 3",
		});
		const tags = await tagService.findAll();
		expect(tags).toHaveLength(3);
		expect(tags[0]!.name).toBe("tag 1");
		expect(tags[1]!.name).toBe("tag 2");
		expect(tags[2]!.name).toBe("tag 3");
	});

	it("returns empty array if no tag exists", async () => {
		const result = await tagService.findAll();

		expect(result).toEqual([]);
	});
});

describe("TagService.update", () => {
	it("updates a tag", async () => {
		const tag = await tagService.create({
			name: "Tag 1",
		});
		const updatedTag = await tagService.update(tag.id, {
			name: "Tag 2",
		});
		expect(updatedTag.name).toBe("tag 2");
	});

	it("throws if tag does not exist", async () => {
		await expect(
			tagService.update("unknown-id", {
				name: "React",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if new name already exists", async () => {
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await tagService.create({
			name: "Tag 2",
		});
		await expect(
			tagService.update(tag.id, {
				name: "Tag 2",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("TagService.delete", () => {
	it("deletes a competence", async () => {
		const tag = await tagService.create({
			name: "Tag 1",
		});
		await tagService.delete(tag.id);
		const tags = await tagService.findAll();
		expect(tags).toHaveLength(0);
	});

	it("throws if tag does not exist", async () => {
		await expect(tagService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	it("throws if tag is used", async () => {
		const tag = await tagService.create({
			name: "React",
		});

		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await cvService.create({
			userId: user.id,
			templateId: template.id,
			title: "Mon CV",
		});

		const group = await cvTagGroupService.create(cv.id, {
			title: "Group 1",
			order: 1,
			tags: [],
		});

		await cvTagService.create(group.id, {
			tagId: tag.id,
			order: 1,
		});

		await expect(tagService.delete(tag.id)).rejects.toThrow(ConflictError);
	});
});
