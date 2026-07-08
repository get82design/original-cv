import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";

describe("CV model", () => {
	//? 20 tests pour le model CV => 20 tests ok
	//   model CV {
	//     id       String @id @default(cuid())
	//     photo    String?
	//     title    String                                // titre du CV
	//     templateId String
	//     template   CVTemplate @relation(fields: [templateId], references: [id])
	//     userId   String
	//     user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
	//     createdAt DateTime @default(now())
	//     updatedAt DateTime @updatedAt
	//     modules  CVModule[]                           // modules qui composent le CV (Skills, Experiences, Education)
	//     // Le reste passera par modules mais ça peut me permettre de faire des appels pour récupérer les données
	//     headerCv CvHeader?
	//     skillGroups CvSkillGroup[]
	//     educations  CvEducation[]
	//     experiences CvExperience[]
	//     achievements CvAchievement[]
	//     strengths CvStrength[]
	//     volunteerings CvVolunteering[]
	//     projects CvProject[]
	//     publications CvPublication[]
	//     languages CvLanguage[]
	//     passions CvPassion[]
	//     socialMedias CvSocialMedia[]
	//     philosophy CvPhilosophy?
	//     expertises CvExpertise[]
	//     prices CvPrice[]
	//     certifications CvCertification[]
	//     formations CvFormation[]
	//     description CvDescription?
	//     competences CvCompetenceGroup[]

	//     status CVStatus @default(DRAFT) // statut du CV, brouillon, publié, archivé
	//     publishedAt DateTime?

	//     publicSlug String? @unique // slug du CV public
	//     isPublic   Boolean @default(false) // si le CV est public

	//     isDefault Boolean @default(false) // si le CV est le CV par défaut de l'utilisateur
	//     pdfUrl     String?
	//     pdfVersion Int @default(0) // version du PDF
	//     pdfGeneratedAt DateTime?

	//     @@index([userId])
	//     @@index([templateId])
	//   }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: créer un CV pour un user avec un template
		it("should create a CV for a user with a template", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			const cv = await prismaTest.cV.create({
				data: {
					title: "Mon CV",
					templateId: template.id,
					userId: user.id,
				},
			});

			expect(cv.title).toBe("Mon CV");
			expect(cv.userId).toBe(user.id);
			expect(cv.templateId).toBe(template.id);
			expect(cv.status).toBe("DRAFT");
			expect(cv.isPublic).toBe(false);
			expect(cv.isDefault).toBe(false);
			expect(cv.pdfVersion).toBe(0);
		});

		// 1-2: créer un CV avec des champs optionnels à null
		it("should allow optional fields to be null", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			const cv = await prismaTest.cV.create({
				data: {
					title: "CV Optionnel",
					templateId: template.id,
					userId: user.id,
					photo: null,
					publicSlug: null,
					publishedAt: null,
					pdfUrl: null,
					pdfGeneratedAt: null,
				},
			});

			expect(cv.photo).toBeNull();
			expect(cv.publicSlug).toBeNull();
			expect(cv.publishedAt).toBeNull();
			expect(cv.pdfUrl).toBeNull();
			expect(cv.pdfGeneratedAt).toBeNull();
		});

		// 1-3: créer un CV avec les champs minimaux requis
		it("should create a CV with minimal required fields", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			const cv = await prismaTest.cV.create({
				data: {
					title: "CV Minimal",
					templateId: template.id,
					userId: user.id,
				},
			});

			expect(cv.title).toBe("CV Minimal");
			expect(cv.userId).toBe(user.id);
			expect(cv.templateId).toBe(template.id);
			expect(cv.status).toBe("DRAFT");
			expect(cv.isPublic).toBe(false);
			expect(cv.isDefault).toBe(false);
			expect(cv.pdfVersion).toBe(0);
			expect(cv.publicSlug).toBeNull();
			expect(cv.pdfUrl).toBeNull();
			expect(cv.pdfGeneratedAt).toBeNull();
			expect(cv.publishedAt).toBeNull();
		});

		// 1-4: créer un CV avec les champs optionnels
		it("should allow optional fields on creation", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 2",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			const now = new Date();
			const cv = await prismaTest.cV.create({
				data: {
					title: "CV Optionnel",
					templateId: template.id,
					userId: user.id,
					photo: "photo.png",
					publicSlug: "cv-optionnel",
					isPublic: true,
					isDefault: true,
					pdfUrl: "http://example.com/cv.pdf",
					pdfVersion: 1,
					pdfGeneratedAt: now,
					status: "PUBLISHED",
					publishedAt: now,
				},
			});

			expect(cv.photo).toBe("photo.png");
			expect(cv.publicSlug).toBe("cv-optionnel");
			expect(cv.isPublic).toBe(true);
			expect(cv.isDefault).toBe(true);
			expect(cv.pdfUrl).toBe("http://example.com/cv.pdf");
			expect(cv.pdfVersion).toBe(1);
			expect(cv.pdfGeneratedAt!.toISOString()).toBe(now.toISOString());
			expect(cv.status).toBe("PUBLISHED");
			expect(cv.publishedAt!.toISOString()).toBe(now.toISOString());
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un CV sans user
		it("should not create a CV without a user", async () => {
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});
			await expect(
				prismaTest.cV.create({
					data: {
						title: "CV sans user",
						templateId: template.id,
						userId: "non-existing-id",
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer un CV sans template
		it("should not create a CV without a template", async () => {
			const user = await createTestUser();
			await expect(
				prismaTest.cV.create({
					data: {
						title: "CV sans template",
						templateId: "non-existing-id",
						userId: user.id,
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer un CV sans title
		it("should not create a CV without a title", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			await expect(
				prismaTest.cV.create({
					// @ts-expect-error - title required
					data: {
						templateId: template.id,
						userId: user.id,
					},
				}),
			).rejects.toThrow();
		});

		// 2-4: ne peut pas créer un CV avec un publicSlug déjà existant
		it("should not allow duplicate publicSlug", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			await prismaTest.cV.create({
				data: {
					title: "CV 1",
					templateId: template.id,
					userId: user.id,
					publicSlug: "mon-cv",
				},
			});

			await expect(
				prismaTest.cV.create({
					data: {
						title: "CV 2",
						templateId: template.id,
						userId: user.id,
						publicSlug: "mon-cv",
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: mettre à jour les champs d'un CV partiellement
		it("should update CV fields partially", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			const cv = await prismaTest.cV.create({
				data: {
					title: "CV original",
					templateId: template.id,
					userId: user.id,
				},
			});

			const updated = await prismaTest.cV.update({
				where: { id: cv.id },
				data: { title: "CV modifié", isPublic: true },
			});

			expect(updated.title).toBe("CV modifié");
			expect(updated.isPublic).toBe(true);
			expect(updated.status).toBe("DRAFT"); // non modifié
		});
	});

	//! 4- UPDATE ERROR TESTS
	describe("UPDATE ERRORS", () => {
		// 4-1: ne peut pas mettre à jour un publicSlug déjà existant
		it("should not allow updating publicSlug to duplicate", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			const cv1 = await prismaTest.cV.create({
				data: {
					title: "CV 1",
					templateId: template.id,
					userId: user.id,
					publicSlug: "slug-1",
				},
			});
			const cv2 = await prismaTest.cV.create({
				data: {
					title: "CV 2",
					templateId: template.id,
					userId: user.id,
					publicSlug: "slug-2",
				},
			});

			await expect(
				prismaTest.cV.update({
					where: { id: cv2.id },
					data: { publicSlug: "slug-1" },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- DELETE TESTS
	describe("DELETE", () => {
		// 5-1: peut supprimer un CV
		it("should delete a CV", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			const cv = await prismaTest.cV.create({
				data: {
					title: "CV à supprimer",
					templateId: template.id,
					userId: user.id,
				},
			});

			await prismaTest.cV.delete({ where: { id: cv.id } });

			const found = await prismaTest.cV.findUnique({ where: { id: cv.id } });
			expect(found).toBeNull();
		});

		// 5-2: supprime les CV quand l'utilisateur est supprimé
		it("should cascade delete when user is deleted", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			await prismaTest.cV.create({
				data: { title: "CV cascade", templateId: template.id, userId: user.id },
			});

			await prismaTest.user.delete({ where: { id: user.id } });

			const cvs = await prismaTest.cV.findMany({ where: { userId: user.id } });
			expect(cvs.length).toBe(0);
		});
	});

	//! 6- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 6-1: peut lier un CV à un user et un template
		it("should link CV to correct user and template", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Template 1",
					structure: { create: [] },
					defaultStyles: { create: [] },
				},
			});

			const cv = await prismaTest.cV.create({
				data: {
					title: "CV relation",
					templateId: template.id,
					userId: user.id,
				},
			});

			const found = await prismaTest.cV.findUnique({
				where: { id: cv.id },
				include: { user: true, template: true },
			});
			expect(found!.user.id).toBe(user.id);
			expect(found!.template.id).toBe(template.id);
		});
	});
});
