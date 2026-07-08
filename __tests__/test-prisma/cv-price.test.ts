import { describe, expect, it } from "vitest";
import { createTestCV } from "../utils/create-test-cv";
import { prismaTest } from "../../lib/prismaTest";

describe("CvPrice model", () => {
	//? 4 tests pour le model CvPrice => 4 tests ok
	// model CvPrice {
	//   id          String @id @default(cuid())
	//   title       String
	//   domaine     String
	//   icon        String?
	//   order       Int @default(0)
	//   cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//   cvId        String
	// }

	it("should create price for CV", async () => {
		const { cv } = await createTestCV();
		const price = await prismaTest.cvPrice.create({
			data: { title: "Price 1", domaine: "Domaine 1", order: 1, cvId: cv.id },
		});
		expect(price.title).toBe("Price 1");
		expect(price.domaine).toBe("Domaine 1");
	});

	it("should not allow duplicate order in same CV", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvPrice.create({
			data: { title: "Price 1", domaine: "Domaine 1", order: 1, cvId: cv.id },
		});
		await expect(
			prismaTest.cvPrice.create({
				data: { title: "Price 2", domaine: "Domaine 2", order: 1, cvId: cv.id },
			}),
		).rejects.toThrow();
	});

	it("should allow same order in different CVs", async () => {
		const { cv: cv1 } = await createTestCV();
		const { cv: cv2 } = await createTestCV();
		await prismaTest.cvPrice.create({
			data: { title: "Price 1", domaine: "Domaine 1", order: 1, cvId: cv1.id },
		});
		await prismaTest.cvPrice.create({
			data: { title: "Price 1", domaine: "Domaine 1", order: 1, cvId: cv2.id },
		});
		const all = await prismaTest.cvPrice.findMany();
		expect(all.length).toBe(2);
	});

	it("should delete expertises when CV is deleted", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvPrice.create({
			data: { title: "Price 1", domaine: "Domaine 1", order: 1, cvId: cv.id },
		});
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const remaining = await prismaTest.cvPrice.findMany({
			where: { cvId: cv.id },
		});
		expect(remaining.length).toBe(0);
	});
});
