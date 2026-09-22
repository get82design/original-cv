import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvCertificationService } from "../../../src/services/cv/cvCertificationService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvCertificationService.create", () => {
	// TEST 1 : création nominale
	it("creates a certification", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const certification = await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		expect(certification.cvId).toBe(cv.id);
		expect(certification.title).toBe("Certification 1");
		expect(certification.organismeCertification).toBe("Organisme 1");
		expect(certification.order).toBe(1);
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvCertificationService.create("unknown-cv", {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : certification déjà existante
	it("throws if certification already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
		});
		await expect(
			cvCertificationService.create(cv.id, {
				title: "Certification 1",
				organismeCertification: "Organisme 2",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		await expect(
			cvCertificationService.create(cv.id, {
				title: "Certification 2",
				organismeCertification: "Organisme 2",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvCertificationService.findAllByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns certifications of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		await cvCertificationService.create(cv.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
			order: 2,
		});

		const result = await cvCertificationService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Certification 1");
		expect(result[1]!.title).toBe("Certification 2");
	});

	// TEST 2 : pas de certification existant
	it("returns empty array if no certification exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvCertificationService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de certification d'un autre CV
	it("does not return certifications from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvCertificationService.create(cvA.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
		});
		await cvCertificationService.create(cvB.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
		});
		const result = await cvCertificationService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Certification 1");
	});
});

describe("CvCertificationService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a certification", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const certification = await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		const updated = await cvCertificationService.update(certification.id, {
			organismeCertification: "Organisme 2",
		});

		expect(updated.organismeCertification).toBe("Organisme 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : certification inexistant
	it("throws if certification does not exist", async () => {
		await expect(
			cvCertificationService.update("unknown-id", {
				organismeCertification: "Organisme 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : certification déjà existante
	it("throws if new certification already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		const certification2 = await cvCertificationService.create(cv.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
			order: 2,
		});
		await expect(
			cvCertificationService.update(certification2.id, {
				title: "Certification 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates certification title", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const certification = await cvCertificationService.create(cv.id, {
			title: "React Certification",
			organismeCertification: "Meta",
			order: 1,
		});
		const updated = await cvCertificationService.update(certification.id, {
			title: "Angular Certification",
		});

		expect(updated.title).toBe("Angular Certification");
	});
});

describe("CvCertificationService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a certification to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const certification1 = await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		const certification2 = await cvCertificationService.create(cv.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
			order: 2,
		});
		await cvCertificationService.move(certification2.id, 1);
		const result = await cvCertificationService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(certification2.id);
		expect(result[1]!.id).toBe(certification1.id);
	});

	// TEST 2 : certification inexistant
	it("throws if certification does not exist", async () => {
		await expect(cvCertificationService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const certification1 = await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		await expect(cvCertificationService.move(certification1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const certification = await cvCertificationService.create(cv.id, {
					title: "Certification 1",
					organismeCertification: "Organisme 1",
					order: 1,
				});
				return { id: certification.id, order: certification.order };
			},
			moveEntity: (id, order) => cvCertificationService.move(id, order),
		});
	});
});

describe("CvCertificationService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a certification", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const certification1 = await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		await cvCertificationService.delete(certification1.id);
		const result = await cvCertificationService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : certification inexistant
	it("throws if certification does not exist", async () => {
		await expect(cvCertificationService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des certifications après suppression
	it("reorders remaining certifications after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvCertificationService.create(cv.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		const certification2 = await cvCertificationService.create(cv.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
			order: 2,
		});
		await cvCertificationService.create(cv.id, {
			title: "Certification 3",
			organismeCertification: "Organisme 3",
			order: 3,
		});
		await cvCertificationService.delete(certification2.id);
		const result = await cvCertificationService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.organismeCertification).toBe("Organisme 3");
		expect(result[0]!.title).toBe("Certification 1");
		expect(result[1]!.title).toBe("Certification 3");
	});
});
