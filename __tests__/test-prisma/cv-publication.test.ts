import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestCV } from "../utils/create-test-cv";

describe("CvPublication model", () => {
	//? 5 tests pour le model CvPublication => 5 tests ok
	//   model CvPublication {
	//     id          String @id @default(cuid())
	//     title       String
	//     description String?
	//     journalName String?
	//     start       DateTime
	//     end         DateTime?
	//     url         String?

	//     order       Int @default(0)
	//     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     cvId        String

	//     @@unique([cvId, title])
	//     @@unique([cvId, order])
	//     @@index([cvId])
	//   }

	//! 1️⃣ CREATE
	describe("CREATE", () => {
		it("should create publication", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const publication = await prismaTest.cvPublication.create({
				data: {
					title: "AI Research Paper",
					start: new Date("2023-01-01"),
					order: 1,
					cvId: cv.id,
				},
			});

			expect(publication.title).toBe("AI Research Paper");
			expect(publication.order).toBe(1);
		});

		it("should create publication with optional fields", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const publication = await prismaTest.cvPublication.create({
				data: {
					title: "Frontend Patterns",
					description: "Modern frontend architecture",
					journalName: "Tech Journal",
					start: new Date("2022-01-01"),
					end: new Date("2022-06-01"),
					url: "https://example.com",
					order: 2,
					cvId: cv.id,
				},
			});

			expect(publication.journalName).toBe("Tech Journal");
			expect(publication.url).toBe("https://example.com");
		});
	});

	//! 2️⃣ UNIQUE CONSTRAINTS
	describe("UNIQUE CONSTRAINTS", () => {
		it("should not allow duplicate title in same CV", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			await prismaTest.cvPublication.create({
				data: {
					title: "Paper A",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvPublication.create({
					data: {
						title: "Paper A",
						start: new Date(),
						order: 2,
						cvId: cv.id,
					},
				}),
			).rejects.toThrow();
		});

		it("should not allow duplicate order in same CV", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			await prismaTest.cvPublication.create({
				data: {
					title: "Paper A",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvPublication.create({
					data: {
						title: "Paper B",
						start: new Date(),
						order: 1,
						cvId: cv.id,
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3️⃣ CASCADE DELETE
	describe("CASCADE DELETE", () => {
		it("should delete publications when CV is deleted", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			await prismaTest.cvPublication.create({
				data: {
					title: "Paper A",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await prismaTest.cV.delete({
				where: { id: cv.id },
			});

			const publications = await prismaTest.cvPublication.findMany({
				where: { cvId: cv.id },
			});

			expect(publications.length).toBe(0);
		});
	});
});
