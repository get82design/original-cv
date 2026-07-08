import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUserWithTemplateAndCV } from "../utils/create-test-user-with-template-and-cv";

describe("CvHeader model", () => {
	//? 6 tests pour le model CvHeader => 6 tests ok
	//   model CvHeader {
	//     id          String @id @default(cuid())
	//     title       String
	//     subtitle    String
	//     phone       String
	//     email       String
	//     location    String
	//     portfolio   String
	//     nom         String
	//     prenom      String

	//     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     cvId        String @unique
	//     @@index([cvId])
	//   }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: créer un header pour un CV
		it("should create a CvHeader for a CV", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();

			const cv = await prismaTest.cV.create({
				data: {
					title: "Mon CV",
					userId: user.id,
					templateId: template.id,
				},
			});

			const header = await prismaTest.cvHeader.create({
				data: {
					title: "Développeur Fullstack",
					subtitle: "Node / React",
					phone: "0123456789",
					email: "test@example.com",
					location: "Paris",
					portfolio: "https://portfolio.com",
					nom: "Dupont",
					prenom: "Jean",
					cvId: cv.id,
				},
			});

			expect(header.cvId).toBe(cv.id);
			expect(header.title).toBe("Développeur Fullstack");
		});

		// 1-2: ne pas pouvoir créer un header sans un CV
		it("should not create CvHeader without a CV", async () => {
			await expect(
				prismaTest.cvHeader.create({
					data: {
						title: "Titre",
						subtitle: "Subtitle",
						phone: "0123456789",
						email: "test@example.com",
						location: "Paris",
						portfolio: "https://portfolio.com",
						nom: "Dupont",
						prenom: "Jean",
						cvId: "fake-cv-id",
					},
				}),
			).rejects.toThrow();
		});

		// 1-3: ne pas pouvoir créer deux headers pour le même CV
		it("should not create two headers for the same CV", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();

			const cv = await prismaTest.cV.create({
				data: { title: "CV 1", userId: user.id, templateId: template.id },
			});

			await prismaTest.cvHeader.create({
				data: {
					title: "Header 1",
					subtitle: "Sub 1",
					phone: "0123",
					email: "a@b.com",
					location: "Paris",
					portfolio: "",
					nom: "N",
					prenom: "P",
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvHeader.create({
					data: {
						title: "Header 2",
						subtitle: "Sub 2",
						phone: "0456",
						email: "c@d.com",
						location: "Lyon",
						portfolio: "",
						nom: "N2",
						prenom: "P2",
						cvId: cv.id,
					},
				}),
			).rejects.toThrow(); // @@unique(cvId)
		});
	});

	//! 2- UPDATE TESTS
	describe("UPDATE", () => {
		// 2-1: mettre à jour les champs d'un header
		it("should update a CvHeader fields", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();
			const cv = await prismaTest.cV.create({
				data: { title: "CV 1", userId: user.id, templateId: template.id },
			});

			const header = await prismaTest.cvHeader.create({
				data: {
					title: "Dev",
					subtitle: "JS",
					phone: "01",
					email: "a@b.com",
					location: "Paris",
					portfolio: "",
					nom: "N",
					prenom: "P",
					cvId: cv.id,
				},
			});

			const updated = await prismaTest.cvHeader.update({
				where: { id: header.id },
				data: { phone: "09", title: "Dev Senior" },
			});

			expect(updated.phone).toBe("09");
			expect(updated.title).toBe("Dev Senior");
			expect(updated.email).toBe("a@b.com"); // inchangé
		});
	});

	//! 3- DELETE TESTS
	describe("DELETE", () => {
		// 3-1: supprimer un header lorsque le CV est supprimé
		it("should delete CvHeader when CV is deleted", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();
			const cv = await prismaTest.cV.create({
				data: { title: "CV", userId: user.id, templateId: template.id },
			});

			const header = await prismaTest.cvHeader.create({
				data: {
					title: "Dev",
					subtitle: "JS",
					phone: "01",
					email: "a@b.com",
					location: "Paris",
					portfolio: "",
					nom: "N",
					prenom: "P",
					cvId: cv.id,
				},
			});

			await prismaTest.cV.delete({ where: { id: cv.id } });

			const fetched = await prismaTest.cvHeader.findUnique({
				where: { id: header.id },
			});

			expect(fetched).toBeNull();
		});
	});

	//! 4- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 4-1: lier un header à un CV
		it("should link header to correct CV", async () => {
			const { user, template } = await createTestUserWithTemplateAndCV();
			const cv = await prismaTest.cV.create({
				data: { title: "CV", userId: user.id, templateId: template.id },
			});

			const header = await prismaTest.cvHeader.create({
				data: {
					title: "Dev",
					subtitle: "JS",
					phone: "01",
					email: "a@b.com",
					location: "Paris",
					portfolio: "",
					nom: "N",
					prenom: "P",
					cvId: cv.id,
				},
			});

			const fetched = await prismaTest.cvHeader.findUnique({
				where: { id: header.id },
				include: { cv: true },
			});

			expect(fetched!.cv.id).toBe(cv.id);
		});
	});
});
