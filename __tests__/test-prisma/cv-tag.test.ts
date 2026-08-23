import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestCV } from "../utils/create-test-cv";

describe("CvTag models", () => {
	//! 1- CREATE TESTS
	describe("CREATE", () => {
		it("should create a global tag and link to CV tag", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			// Créer la tag globale
			const tag = await prismaTest.tag.create({
				data: { name: "JavaScript" },
			});

			// Créer un groupe de tags pour le CV
			const group = await prismaTest.cvTagGroup.create({
				data: { cvId: cv.id, title: "Tech Skills", order: 1 },
			});

			// Ajouter la tag au groupe
			const cvTag = await prismaTest.cvTag.create({
				data: { groupId: group.id, tagId: tag.id },
			});

			expect(cvTag.groupId).toBe(group.id);
			expect(cvTag.tagId).toBe(tag.id);
		});

		it("should allow multiple tags in one group", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const t1 = await prismaTest.tag.create({
				data: { name: "JavaScript" },
			});
			const t2 = await prismaTest.tag.create({
				data: { name: "TypeScript" },
			});

			const group = await prismaTest.cvTagGroup.create({
				data: { cvId: cv.id, title: "Tech Tags", order: 1 },
			});

			await prismaTest.cvTag.create({
				data: { groupId: group.id, tagId: t1.id, order: 1 },
			});
			await prismaTest.cvTag.create({
				data: { groupId: group.id, tagId: t2.id, order: 2 },
			});

			const tags = await prismaTest.cvTag.findMany({
				where: { groupId: group.id },
			});
			expect(tags.length).toBe(2);
		});
	});

	//! 2- UNIQUE / ERROR TESTS
	describe("CREATE ERRORS", () => {
		it("should not allow duplicate tag in same group", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const tag = await prismaTest.tag.create({
				data: { name: "JavaScript" },
			});
			const group = await prismaTest.cvTagGroup.create({
				data: { cvId: cv.id, order: 1 },
			});

			await prismaTest.cvTag.create({
				data: { groupId: group.id, tagId: tag.id },
			});

			await expect(
				prismaTest.cvTag.create({
					data: { groupId: group.id, tagId: tag.id },
				}),
			).rejects.toThrow();
		});

		it("should not allow duplicate group order in same CV", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			await prismaTest.cvTagGroup.create({
				data: { cvId: cv.id, order: 1 },
			});

			await expect(
				prismaTest.cvTagGroup.create({
					data: { cvId: cv.id, order: 1 },
				}),
			).rejects.toThrow();
		});
	});

	//! 3- DELETE TESTS
	describe("DELETE", () => {
		it("should delete CV tags when group is deleted", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const tag = await prismaTest.tag.create({
				data: { name: "JavaScript" },
			});
			const group = await prismaTest.cvTagGroup.create({
				data: { cvId: cv.id, order: 1 },
			});
			await prismaTest.cvTag.create({
				data: { groupId: group.id, tagId: tag.id },
			});

			await prismaTest.cvTagGroup.delete({ where: { id: group.id } });

			const tags = await prismaTest.cvTag.findMany({
				where: { groupId: group.id },
			});
			expect(tags.length).toBe(0);
		});

		it("should delete groups when CV is deleted", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			await prismaTest.cvTagGroup.create({
				data: { cvId: cv.id, order: 1 },
			});

			await prismaTest.cV.delete({ where: { id: cv.id } });

			const groups = await prismaTest.cvTagGroup.findMany({
				where: { cvId: cv.id },
			});
			expect(groups.length).toBe(0);
		});
	});
});
