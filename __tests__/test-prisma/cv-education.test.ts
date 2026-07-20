import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestCV } from "../utils/create-test-cv";
import { CvTimelineStatus } from "../../generated/prisma/enums";

describe("CvEducation model", () => {
	//? 5 tests pour le model CvEducation => 5 tests ok
	//   model CvEducation {
	//     id          String @id @default(cuid())
	//     title     String?
	//     school    String
	//     city      String?
	//     degree    String
	//     start     DateTime
	//     end       DateTime?
	//     obtained  Boolean @default(false)

	//     order     Int @default(0)
	//     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     cvId        String

	//     @@unique([cvId, title])
	//     @@unique([cvId, order])
	//     @@index([cvId])
	//   }

	//! 1️⃣ CREATE
	describe("CREATE", () => {
		it("should create an education entry", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const education = await prismaTest.cvEducation.create({
				data: {
					title: "Master Informatique",
					school: "Sorbonne",
					degree: "Master",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			expect(education.school).toBe("Sorbonne");
			expect(education.degree).toBe("Master");
			expect(education.cvId).toBe(cv.id);
			expect(education.obtained).toBe(null); // default value
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

			await prismaTest.cvEducation.create({
				data: {
					title: "Licence Info",
					school: "Paris 1",
					degree: "Licence",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvEducation.create({
					data: {
						title: "Licence Info",
						school: "Paris 2",
						degree: "Licence",
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

			await prismaTest.cvEducation.create({
				data: {
					title: "Licence",
					school: "Paris",
					degree: "Licence",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvEducation.create({
					data: {
						title: "Master",
						school: "Paris",
						degree: "Master",
						start: new Date(),
						order: 1,
						cvId: cv.id,
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3️⃣ UPDATE
	describe("UPDATE", () => {
		it("should update education fields", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const education = await prismaTest.cvEducation.create({
				data: {
					title: "Licence",
					school: "Paris",
					degree: "Licence",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			const updated = await prismaTest.cvEducation.update({
				where: { id: education.id },
				data: {
					obtained: CvTimelineStatus.COMPLETED,
					city: "Paris",
				},
			});

			expect(updated.obtained).toBe(CvTimelineStatus.COMPLETED);
			expect(updated.city).toBe("Paris");
		});
	});

	//! 4️⃣ DELETE CASCADE
	describe("DELETE CASCADE", () => {
		it("should delete educations when CV is deleted", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			await prismaTest.cvEducation.create({
				data: {
					title: "Licence",
					school: "Paris",
					degree: "Licence",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await prismaTest.cV.delete({
				where: { id: cv.id },
			});

			const educations = await prismaTest.cvEducation.findMany({
				where: { cvId: cv.id },
			});

			expect(educations.length).toBe(0);
		});
	});
});
