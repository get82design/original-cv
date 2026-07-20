import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvPhilosophyService } from "../../../src/services/cv/cvPhilosophyService";

describe("CvPhilosophyService.create", () => {
	// TEST 1 : création nominale
	it("creates a philosophy", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const philosophy = await cvPhilosophyService.create(cv.id, {
			citation: "La simplicité est la sophistication suprême",
			author: "Léonard de Vinci",
		});

		expect(philosophy.cvId).toBe(cv.id);
		expect(philosophy.citation).toBe(
			"La simplicité est la sophistication suprême",
		);
		expect(philosophy.author).toBe("Léonard de Vinci");
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvPhilosophyService.create("unknown-cv", {
				citation: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : philosophy déjà existante
	it("throws if philosophy already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await cvPhilosophyService.create(cv.id, {
			citation: "Première",
		});
		await expect(
			cvPhilosophyService.create(cv.id, {
				citation: "Deuxième",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : création sans auteur
	it("creates a philosophy without author", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const philosophy = await cvPhilosophyService.create(cv.id, {
			citation: "Ma philosophie",
		});

		expect(philosophy.citation).toBe("Ma philosophie");
		expect(philosophy.author).toBeNull();
	});
});

describe("CvPhilosophyService.findByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns the philosophy of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const created = await cvPhilosophyService.create(cv.id, {
			citation: "La simplicité est la clé",
			author: "John Doe",
		});
		const result = await cvPhilosophyService.findByCvId(cv.id);

		expect(result.id).toBe(created.id);
		expect(result.cvId).toBe(cv.id);
		expect(result.citation).toBe("La simplicité est la clé");
		expect(result.author).toBe("John Doe");
	});

	// TEST 2 : philosophy inexistante
	it("throws if philosophy does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(cvPhilosophyService.findByCvId(cv.id)).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("CvPhilosophyService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a philosophy", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPhilosophyService.create(cv.id, {
			citation: "Ancienne citation",
			author: "Ancien auteur",
		});
		const updated = await cvPhilosophyService.update(cv.id, {
			citation: "Nouvelle citation",
		});

		expect(updated.citation).toBe("Nouvelle citation");
		expect(updated.author).toBe("Ancien auteur");
	});

	// TEST 2 : philosophy inexistante
	it("throws if philosophy does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			cvPhilosophyService.update(cv.id, {
				citation: "Test",
			}),
		).rejects.toThrow(NotFoundError);
	});
});

describe("CvPhilosophyService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a philosophy", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPhilosophyService.create(cv.id, {
			citation: "Ma philosophie",
		});
		await cvPhilosophyService.delete(cv.id);
		await expect(cvPhilosophyService.findByCvId(cv.id)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 2 : philosophy inexistante
	it("throws if philosophy does not exist", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expect(cvPhilosophyService.delete(cv.id)).rejects.toThrow(
			NotFoundError,
		);
	});
});
