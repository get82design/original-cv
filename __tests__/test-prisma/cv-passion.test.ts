import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestCV } from "../utils/create-test-cv";

describe("CvPassion model", () => {
	//? 5 tests pour le model CvPassion => 5 tests ok
	//   model CvPassion {
	//     id          String @id @default(cuid())
	//     title       String
	//     icon        String

	//     order       Int @default(0)
	//     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     cvId        String

	//     @@unique([cvId, title])
	//     @@unique([cvId, order])
	//     @@index([cvId])
	//   }

	//! 1️⃣ CREATE
	describe("CREATE", () => {
		it("should create a passion for CV", async () => {
			const { cv } = await createTestCV();

			const passion = await prismaTest.cvPassion.create({
				data: {
					title: "Photography",
					icon: "camera",
					order: 1,
					cvId: cv.id,
				},
			});

			expect(passion.title).toBe("Photography");
			expect(passion.icon).toBe("camera");
			expect(passion.order).toBe(1);
		});
	});

	//! 2️⃣ UNIQUE CONSTRAINTS
	describe("UNIQUE CONSTRAINTS", () => {
		it("should not allow duplicate title in same CV", async () => {
			const { cv } = await createTestCV();

			await prismaTest.cvPassion.create({
				data: { title: "Photography", icon: "camera", order: 1, cvId: cv.id },
			});

			await expect(
				prismaTest.cvPassion.create({
					data: { title: "Photography", icon: "photo", order: 2, cvId: cv.id },
				}),
			).rejects.toThrow();
		});

		it("should not allow duplicate order in same CV", async () => {
			const { cv } = await createTestCV();

			await prismaTest.cvPassion.create({
				data: { title: "Photography", icon: "camera", order: 1, cvId: cv.id },
			});

			await expect(
				prismaTest.cvPassion.create({
					data: { title: "Travel", icon: "plane", order: 1, cvId: cv.id },
				}),
			).rejects.toThrow();
		});
	});

	//! 3️⃣ RELATIONS
	describe("RELATIONS", () => {
		it("should allow same title in different CVs", async () => {
			const { cv: cv1 } = await createTestCV();
			const { cv: cv2 } = await createTestCV();

			await prismaTest.cvPassion.create({
				data: { title: "Photography", icon: "camera", order: 1, cvId: cv1.id },
			});

			await prismaTest.cvPassion.create({
				data: { title: "Photography", icon: "camera", order: 1, cvId: cv2.id },
			});

			const passions = await prismaTest.cvPassion.findMany();
			expect(passions.length).toBe(2);
		});
	});

	//! 4️⃣ CASCADE DELETE
	describe("CASCADE DELETE", () => {
		it("should delete passions when CV is deleted", async () => {
			const { cv } = await createTestCV();

			await prismaTest.cvPassion.create({
				data: { title: "Photography", icon: "camera", order: 1, cvId: cv.id },
			});

			await prismaTest.cV.delete({ where: { id: cv.id } });

			const passions = await prismaTest.cvPassion.findMany({
				where: { cvId: cv.id },
			});

			expect(passions.length).toBe(0);
		});
	});
});
