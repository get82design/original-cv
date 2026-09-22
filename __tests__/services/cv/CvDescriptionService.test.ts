import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvDescriptionService } from "../../../src/services/cv/cvDescriptionService";

describe("CvDescriptionService.create", () => {
	// TEST 1 : création nominale
	it("creates a description", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const description = await cvDescriptionService.create(cv.id, {
			description: "Développeur fullstack passionné",
		});

		expect(description.cvId).toBe(cv.id);
		expect(description.description).toBe("Développeur fullstack passionné");
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvDescriptionService.create("unknown-cv", {
				description: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : description déjà existante
	it("throws if description already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await cvDescriptionService.create(cv.id, {
			description: "Première description",
		});

		await expect(
			cvDescriptionService.create(cv.id, {
				description: "Deuxième description",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvDescriptionService.findByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns the description of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const created = await cvDescriptionService.create(cv.id, {
			description: "Développeur fullstack",
		});
		const result = await cvDescriptionService.findByCvId(cv.id);

		expect(result.id).toBe(created.id);
		expect(result.cvId).toBe(cv.id);
		expect(result.description).toBe("Développeur fullstack");
	});

	// TEST 2 : description inexistante
	it("throws if description does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(cvDescriptionService.findByCvId(cv.id)).rejects.toThrow(NotFoundError);
	});
});

describe("CvDescriptionService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a description", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await cvDescriptionService.create(cv.id, {
			description: "Ancienne description",
		});

		const updated = await cvDescriptionService.update(cv.id, {
			description: "Nouvelle description",
		});

		expect(updated.description).toBe("Nouvelle description");
	});

	// TEST 2 : description inexistante
	it("throws if description does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			cvDescriptionService.update(cv.id, {
				description: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("CvDescriptionService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a description", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await cvDescriptionService.create(cv.id, {
			description: "Ma description",
		});

		await cvDescriptionService.delete(cv.id);

		await expect(cvDescriptionService.findByCvId(cv.id)).rejects.toThrow(NotFoundError);
	});

	// TEST 2 : description inexistante
	it("throws if description does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(cvDescriptionService.delete(cv.id)).rejects.toThrow(NotFoundError);
	});
});
