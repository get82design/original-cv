import { describe, expect, it } from "vitest";
import { cvService } from "../../../src/services/cv/cvService";
import { buildCvComplete, createCV } from "../../utils/create-test-cv-full-flow";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import {
	AppError,
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { CvTimelineStatus, Level } from "../../../generated/prisma/client";
import { prismaTest } from "../../../lib/prismaTest";

const createCvAndReturnResult = async () => {
	const user = await createTestUser();
	const template = await createTestTemplate();
	const cv = await createCV(user.id, template.id);
	const dateStart = new Date();
	const dateEnd = new Date();
	await buildCvComplete(cv.id, dateStart, dateEnd);
	const result = await cvService.findById(cv.id);
	return { result, dateStart, dateEnd };
};

describe("CvService.create", () => {
	// TEST 1 : Créer un CV
	it("creates a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await cvService.create({
			userId: user.id,
			templateId: template.id,
			title: "Mon CV",
		});

		expect(cv.userId).toBe(user.id);
		expect(cv.templateId).toBe(template.id);
		expect(cv.title).toBe("Mon CV");

		const dbCV = await prismaTest.cV.findUnique({
			where: {
				id: cv.id,
			},
		});

		expect(dbCV).not.toBeNull();
		expect(dbCV!.title).toBe("Mon CV");
	});

	it("sets primaryColorName from template defaultStyles when present", async () => {
		const user = await createTestUser();
		const template = await prismaTest.cVTemplate.create({
			data: {
				name: `Template_color_${Date.now()}`,
				structure: { sections: ["header"] },
				defaultStyles: {
					primaryColor: { name: "violet", primary: "-600" },
					slugTemplate: "test",
				},
			},
		});

		const cv = await cvService.create({
			userId: user.id,
			templateId: template.id,
			title: "CV couleur",
		});

		expect(cv.primaryColorName).toBe("violet");
	});

	// TEST 2 : Lancer une erreur si l'utilisateur n'existe pas
	it("throws if user does not exist", async () => {
		const template = await createTestTemplate();

		await expect(
			cvService.create({
				userId: "unknown-user",
				templateId: template.id,
				title: "Mon CV",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : Lancer une erreur si le template n'existe pas
	it("throws if template does not exist", async () => {
		const user = await createTestUser();

		await expect(
			cvService.create({
				userId: user.id,
				templateId: "unknown-template",
				title: "Mon CV",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if CV already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { maxCvs: 2 },
		});
		const cv = await createCV(user.id, template.id);
		await expect(
			cvService.create({
				userId: user.id,
				templateId: template.id,
				title: "Fullflow CV",
			}),
		).rejects.toThrow(AppError);
	});

	it("throws ValidationError when CV quota is reached", async () => {
		const user = await createTestUser(); // maxCvs = 1 par défaut
		const template = await createTestTemplate();
		await cvService.create({
			userId: user.id,
			templateId: template.id,
			title: "Premier CV",
		});
		await expect(
			cvService.create({
				userId: user.id,
				templateId: template.id,
				title: "Deuxième CV",
			}),
		).rejects.toThrow(ValidationError);
	});
	it("allows create when maxCvs is increased", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		await cvService.create({
			userId: user.id,
			templateId: template.id,
			title: "CV 1",
		});
		await prismaTest.user.update({
			where: { id: user.id },
			data: { maxCvs: 2 },
		});
		const cv2 = await cvService.create({
			userId: user.id,
			templateId: template.id,
			title: "CV 2",
		});
		expect(cv2.title).toBe("CV 2");
	});
});

describe("CvService.findById", () => {
	// TEST 1 : Trouver un CV par son id
	it("should find a CV by id", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const createdCV = await createCV(user.id, template.id);

		const cv = await cvService.findById(createdCV.id);

		expect(cv).not.toBeNull();
		expect(cv!.id).toBe(createdCV.id);
		expect(cv!.userId).toBe(user.id);
		expect(cv!.templateId).toBe(template.id);
		expect(cv!.title).toBe(createdCV.title);
	});

	// TEST 2 : Lancer une erreur si le CV n'existe pas
	it("should throw if CV doesn't exist", async () => {
		await expect(cvService.findById("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : Charger les entités liées au CV
	it("should load related entities", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result).not.toBeNull();
	});

	// TEST 4 : Charger header
	it("should load header", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result).not.toBeNull();
		expect(result!.headerCv).toMatchObject({
			title: "Mon CV",
			prenom: "Doe",
			nom: "John",
			email: "test@test.com",
			phone: "06 06 06 06 06",
			location: "123 Rue de la Paix, Paris, France",
			portfolio: "https://test.com",
		});
	});

	// TEST 5 : Charger description
	it("should load description", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.description).toBeDefined();
	});

	// TEST 6 : Charger skill groups
	it("should load skill groups", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.skillGroups.length).toBe(1);
		expect(result!.skillGroups[0]).toMatchObject({
			title: "Mon Skill Group",
			skills: [
				{
					skill: {
						name: "Mon Skill",
					},
				},
			],
		});
	});

	// TEST 7 : Charger languages
	it("should load languages", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.languages.length).toBe(1);
		expect(result!.languages[0]).toMatchObject({
			name: "Mon Language",
			level: Level.Intermédiaire,
			order: 1,
		});
	});

	// TEST 8 : Charger passions
	it("should load passions", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.passions.length).toBe(1);
		expect(result!.passions[0]).toMatchObject({
			title: "Mon Passion",
			icon: "Mon Icon",
			order: 1,
		});
	});

	// TEST 9 : Charger philosophy
	it("should load philosophy", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.philosophy).toBeDefined();
		expect(result!.philosophy).toMatchObject({
			citation: "Mon Citation",
			author: "Mon Auteur",
		});
	});

	// TEST 10 : Charger prizes
	it("should load prizes", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.prizes.length).toBe(1);
		expect(result!.prizes[0]).toMatchObject({
			title: "Mon Prize",
			domaine: "Mon Domaine",
			order: 1,
			icon: "Mon Icon",
		});
	});

	// TEST 11 : Charger projects
	it("should load projects", async () => {
		const { result, dateStart, dateEnd } = await createCvAndReturnResult();
		expect(result!.projects.length).toBe(1);
		expect(result!.projects[0]).toMatchObject({
			title: "Mon Project",
			start: dateStart,
			end: dateEnd,
			description: "Mon Description",
			location: "Mon Location",
			technology: "Mon Technology",
			order: 1,
			cvMissions: [
				{
					content: "Mon Mission Project",
				},
			],
		});
	});

	// TEST 12 : Charger volunteerings
	it("should load volunteerings", async () => {
		const { result, dateStart, dateEnd } = await createCvAndReturnResult();
		expect(result!.volunteerings.length).toBe(1);
		expect(result!.volunteerings[0]).toMatchObject({
			title: "Mon Volunteering",
			organisation: "Mon Organisation",
			order: 1,
			start: dateStart,
			end: dateEnd,
			description: "Mon Description",
			location: "Mon Location",
			cvMissions: [
				{
					content: "Mon Mission Volunteering",
				},
			],
		});
	});

	// TEST 13 : Charger certifications
	it("should load certifications", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.certifications.length).toBe(1);
		expect(result!.certifications[0]).toMatchObject({
			title: "Mon Certification",
			organismeCertification: "Mon Organisme Certification",
			order: 1,
		});
	});

	// TEST 14 : Charger formations
	it("should load formations", async () => {
		const { result, dateStart, dateEnd } = await createCvAndReturnResult();
		expect(result!.formations.length).toBe(1);
		expect(result!.formations[0]).toMatchObject({
			title: "Mon Formation",
			organismeFormation: "Mon Organisme Formation",
			order: 1,
			start: dateStart,
			end: dateEnd,
		});
	});

	// TEST 15 : Charger competences
	it("should load competences", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.competences.length).toBe(1);
		expect(result!.competences[0]).toMatchObject({
			title: "Mon Competence Group",
			cvCompetences: [
				{
					competence: {
						name: "Mon Competence",
					},
				},
			],
		});
	});

	// TEST 16 : Charger publications
	it("should load publications", async () => {
		const { result, dateStart, dateEnd } = await createCvAndReturnResult();
		expect(result!.publications.length).toBe(1);
		expect(result!.publications[0]).toMatchObject({
			title: "Mon Publication",
			start: dateStart,
			end: dateEnd,
			description: "Mon Description",
			journalName: "Mon Journal",
			url: "Mon Url",
			order: 1,
		});
	});

	// TEST 17 : Charger social medias
	it("should load social medias", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.socialMedias.length).toBe(1);
		expect(result!.socialMedias[0]).toMatchObject({
			socialNetwork: "Mon Social Media",
			username: "Mon Username",
			order: 1,
		});
	});

	// TEST 18 : Charger strengths
	it("should load strengths", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.strengths.length).toBe(1);
		expect(result!.strengths[0]).toMatchObject({
			title: "Mon Strength",
			order: 1,
			icon: "Mon Icon",
		});
	});

	// TEST 19 : Charger educations
	it("should load educations", async () => {
		const { result, dateStart, dateEnd } = await createCvAndReturnResult();
		expect(result!.educations.length).toBe(1);
		expect(result!.educations[0]).toMatchObject({
			title: "Mon Education",
			school: "Mon School",
			degree: "Mon Degree",
			start: dateStart,
			end: dateEnd,
			city: "Mon City",
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});
	});

	// TEST 20 : Charger experiences
	it("should load experiences", async () => {
		const { result, dateStart, dateEnd } = await createCvAndReturnResult();
		expect(result!.experiences.length).toBe(1);
		expect(result!.experiences[0]).toMatchObject({
			title: "Mon Experience",
			company: "Mon Company",
			start: dateStart,
			end: dateEnd,
			description: "Mon Description",
			location: "Mon Location",
			order: 1,
			cvMissions: [
				{
					content: "Mon Mission Experience",
				},
			],
		});
	});

	// TEST 21 : Charger achievements
	it("should load achievements", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.achievements.length).toBe(1);
		expect(result!.achievements[0]).toMatchObject({
			title: "Mon Achievement",
			description: "Mon Description",
			year: 2026,
			technology: "Mon Technology",
			order: 1,
		});
	});

	// TEST 22 : Charger expertises
	it("should load expertises", async () => {
		const { result } = await createCvAndReturnResult();
		expect(result!.expertises.length).toBe(1);
		expect(result!.expertises[0]).toMatchObject({
			title: "Mon Expertise",
			level: Level.Intermédiaire,
			order: 1,
		});
	});
});

describe("CvService.update", () => {
	// TEST 1 : Mettre à jour un CV
	it("updates a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await createCV(user.id, template.id);

		const updated = await cvService.update(cv.id, user.id, {
			title: "Nouveau titre",
			templateId: template.id,
		});

		expect(updated.title).toBe("Nouveau titre");
		expect(updated.userId).toBe(user.id);
		expect(updated.templateId).toBe(template.id);
	});

	// TEST 2 : Lancer une erreur si le CV n'existe pas
	it("throws if CV does not exist", async () => {
		const user = await createTestUser();

		await expect(
			cvService.update("unknown-cv", user.id, {
				title: "Test",
			}),
		).rejects.toMatchObject({
			code: "CV_NOT_FOUND",
		});
	});

	// TEST 3 : Lancer une erreur si l'utilisateur ne possède pas le CV
	it("throws if user does not own CV", async () => {
		const userA = await createTestUser();
		const userB = await createTestUser();

		const template = await createTestTemplate();

		const cv = await createCV(userA.id, template.id);

		await expect(
			cvService.update(cv.id, userB.id, {
				title: "Hack",
			}),
		).rejects.toThrow(ForbiddenError);
	});

	// TEST 4 : Mettre à jour uniquement les champs fournis
	it("updates only provided fields", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await createCV(user.id, template.id);

		const updated = await cvService.update(cv.id, user.id, {
			title: "Nouveau titre",
		});

		expect(updated.title).toBe("Nouveau titre");

		expect(updated.templateId).toBe(template.id);

		const dbCV = await prismaTest.cV.findUnique({
			where: {
				id: cv.id,
			},
		});

		expect(dbCV!.title).toBe("Nouveau titre");
		expect(dbCV!.templateId).toBe(template.id);
	});

	// TEST 5 : Mettre à jour le template
	it("updates template", async () => {
		const user = await createTestUser();

		const templateA = await createTestTemplate();
		const templateB = await createTestTemplate();

		const cv = await createCV(user.id, templateA.id);

		const updated = await cvService.update(cv.id, user.id, {
			templateId: templateB.id,
		});

		expect(updated.templateId).toBe(templateB.id);
	});
});

describe("CvService.delete", () => {
	// TEST 1 : Supprimer un CV
	it("deletes a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await createCV(user.id, template.id);

		const deleted = await cvService.delete(cv.id, user.id);

		expect(deleted.id).toBe(cv.id);

		const dbCV = await prismaTest.cV.findUnique({
			where: {
				id: cv.id,
			},
		});

		expect(dbCV).toBeNull();
	});

	// TEST 2 : Lancer une erreur si le CV n'existe pas
	it("throws if CV does not exist", async () => {
		const user = await createTestUser();

		await expect(cvService.delete("unknown-cv", user.id)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : Lancer une erreur si l'utilisateur ne possède pas le CV
	it("throws if user does not own CV", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();

		const template = await createTestTemplate();

		const cv = await createCV(owner.id, template.id);

		await expect(cvService.delete(cv.id, otherUser.id)).rejects.toThrow(ForbiddenError);

		const dbCV = await prismaTest.cV.findUnique({
			where: {
				id: cv.id,
			},
		});

		expect(dbCV).not.toBeNull();
	});
});

describe("CvService.findAllByUser", () => {
	it("returns only the user's CVs", async () => {
		const userA = await createTestUser();
		const userB = await createTestUser();
		const template = await createTestTemplate();
		const cvA1 = await createCV(userA.id, template.id, "CV A1");
		const cvA2 = await createCV(userA.id, template.id, "CV A2");
		await createCV(userB.id, template.id, "CV B");
		const list = await cvService.findAllByUser(userA.id);
		expect(list).toHaveLength(2);
		expect(list.map((cv) => cv.id).sort()).toEqual([cvA1.id, cvA2.id].sort());
	});
	it("returns an empty array when user has no CVs", async () => {
		const user = await createTestUser();
		const list = await cvService.findAllByUser(user.id);
		expect(list).toEqual([]);
	});
});

describe("CvService.setPreview", () => {
	const SAMPLE_WITH = `data:image/jpeg;base64,${Buffer.from("withlogo").toString("base64")}`;
	const SAMPLE_CLEAN = `data:image/jpeg;base64,${Buffer.from("clean").toString("base64")}`;

	it("stores both preview URLs as uploaded file paths", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		const updated = await cvService.setPreview(cv.id, user.id, SAMPLE_WITH, SAMPLE_CLEAN);

		expect(updated.previewUrl).toMatch(
			new RegExp(`^/uploads/cv-previews/${user.id}/${cv.id}-with\\.jpg$`),
		);
		expect(updated.previewUrlClean).toMatch(
			new RegExp(`^/uploads/cv-previews/${user.id}/${cv.id}-clean\\.jpg$`),
		);

		// re-save même clé : ne doit pas supprimer le fichier qu’on vient d’écrire
		const again = await cvService.setPreview(cv.id, user.id, SAMPLE_WITH, SAMPLE_CLEAN);
		expect(again.previewUrl).toBe(updated.previewUrl);
	});

	it("throws NotFoundError for unknown CV", async () => {
		const user = await createTestUser();
		await expect(
			cvService.setPreview("unknown", user.id, SAMPLE_WITH, SAMPLE_CLEAN),
		).rejects.toThrow(NotFoundError);
	});

	it("throws ForbiddenError when CV belongs to another user", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);

		await expect(cvService.setPreview(cv.id, other.id, SAMPLE_WITH, SAMPLE_CLEAN)).rejects.toThrow(
			ForbiddenError,
		);
	});
});
