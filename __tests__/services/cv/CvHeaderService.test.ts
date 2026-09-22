import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { cvHeaderService } from "../../../src/services/cv/cvHeaderService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";

describe("CvHeaderService.create", () => {
	// TEST 1 : création nominale
	it("creates a header", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await createCV(user.id, template.id);

		const header = await cvHeaderService.create(cv.id, {
			title: "Mon CV",
			subtitle: "Développeur Fullstack",
			prenom: "John",
			nom: "Doe",
			email: "test@test.com",
			phone: "0606060606",
			location: "Paris, France",
			portfolio: "https://example.com",
		});

		expect(header.cvId).toBe(cv.id);
		expect(header.title).toBe("Mon CV");
		expect(header.prenom).toBe("John");
		expect(header.nom).toBe("Doe");
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvHeaderService.create("unknown-cv", {
				title: "Mon CV",
				prenom: "John",
				nom: "Doe",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : CV déjà avec un header
	it("throws if CV already has a header", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await createCV(user.id, template.id);

		await cvHeaderService.create(cv.id, {
			title: "Premier",
			prenom: "John",
			nom: "Doe",
		});

		await expect(
			cvHeaderService.create(cv.id, {
				title: "Deuxième",
				prenom: "Jane",
				nom: "Doe",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : création avec champs optionnels
	it("creates a header with optional fields", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const header = await cvHeaderService.create(cv.id, {
			title: "Mon CV",
		});

		expect(header.title).toBe("Mon CV");
		expect(header.email).toBeNull();
		expect(header.prenom).toBeNull();
	});
});

describe("CvHeaderService.findByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns the header of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const created = await cvHeaderService.create(cv.id, {
			title: "Mon CV",
			prenom: "John",
			nom: "Doe",
		});

		const header = await cvHeaderService.findByCvId(cv.id);

		expect(header.id).toBe(created.id);
		expect(header.cvId).toBe(cv.id);
		expect(header.title).toBe("Mon CV");
	});

	// TEST 2 : header inexistant
	it("throws if header does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(cvHeaderService.findByCvId(cv.id)).rejects.toThrow(NotFoundError);
	});
});

describe("CvHeaderService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a header", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvHeaderService.create(cv.id, {
			title: "Ancien titre",
			prenom: "John",
			nom: "Doe",
		});
		const updated = await cvHeaderService.update(cv.id, {
			title: "Nouveau titre",
			email: "test@test.com",
		});
		expect(updated.title).toBe("Nouveau titre");
		expect(updated.email).toBe("test@test.com");
		expect(updated.prenom).toBe("John");
	});

	// TEST 2 : header inexistant
	it("throws if header does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(
			cvHeaderService.update(cv.id, {
				title: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("CvHeaderService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a header", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvHeaderService.create(cv.id, {
			title: "Mon CV",
			prenom: "John",
			nom: "Doe",
		});
		await cvHeaderService.delete(cv.id);
		await expect(cvHeaderService.findByCvId(cv.id)).rejects.toThrow(NotFoundError);
	});

	// TEST 2 : header inexistant
	it("throws if header does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(cvHeaderService.delete(cv.id)).rejects.toThrow(NotFoundError);
	});
});
