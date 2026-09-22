import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with tags", () => {
	it("should create a CV with tag group and tags", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const tagGroup = await utils.createTagGroup(cv.id, "tags", 1);
		const tag = await utils.createTag("JavaScript");
		await utils.addTagToGroup(tag.id, tagGroup.id);

		const dbCV = await prismaTest.cV.findUnique({
			where: { id: cv.id },
			include: {
				tagGroups: {
					include: { tags: { include: { tag: true } } },
				},
			},
		});

		expect(dbCV!.tagGroups[0]!.tags[0]!.tag.name).toBe("JavaScript");
	});

	it("should cascade delete CV modules and items", async () => {
		const { user, template } = await utils.createUserAndTemplate("delete@fullflow.com");
		const cv = await utils.createCV(user.id, template.id);
		const tagGroup = await utils.createTagGroup(cv.id, "tags", 1);
		const tag = await utils.createTag("TypeScript");
		await utils.addTagToGroup(tag.id, tagGroup.id);

		await prismaTest.cV.delete({ where: { id: cv.id } });

		const dbModules = await prismaTest.cvTagGroup.findMany({
			where: { cvId: cv.id },
		});
		const dbtags = await prismaTest.cvTag.findMany();
		expect(dbModules.length).toBe(0);
		expect(dbtags.length).toBe(0);
	});
});
