import { describe, expect, it } from "vitest";
import { createTestCV } from "../utils/create-test-cv";
import { prismaTest } from "../../lib/prismaTest";

describe("CvExpertise model", () => {
	//? 4 tests pour le model CvExpertise => 4 tests ok
	// model CvExpertise {
	//   id          String @id @default(cuid())
	//   title       String
	//   level       Level
	//   order       Int @default(0)
	//   cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//   cvId        String
	// }

	it("should create expertise for CV", async () => {
		const { cv } = await createTestCV();
		const exp = await prismaTest.cvExpertise.create({
			data: { title: "Expert in JS", level: "Expert", order: 1, cvId: cv.id },
		});
		expect(exp.title).toBe("Expert in JS");
	});

	it("should not allow duplicate order in same CV", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvExpertise.create({
			data: { title: "JS", level: "Expert", order: 1, cvId: cv.id },
		});
		await expect(
			prismaTest.cvExpertise.create({
				data: { title: "TS", level: "Expert", order: 1, cvId: cv.id },
			}),
		).rejects.toThrow();
	});

	it("should allow same order in different CVs", async () => {
		const { cv: cv1 } = await createTestCV();
		const { cv: cv2 } = await createTestCV();
		await prismaTest.cvExpertise.create({
			data: { title: "JS", level: "Expert", order: 1, cvId: cv1.id },
		});
		await prismaTest.cvExpertise.create({
			data: { title: "JS", level: "Expert", order: 1, cvId: cv2.id },
		});
		const all = await prismaTest.cvExpertise.findMany();
		expect(all.length).toBe(2);
	});

	it("should delete expertises when CV is deleted", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvExpertise.create({
			data: { title: "JS", level: "Expert", order: 1, cvId: cv.id },
		});
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const remaining = await prismaTest.cvExpertise.findMany({
			where: { cvId: cv.id },
		});
		expect(remaining.length).toBe(0);
	});
});
