import { describe, expect, it } from "vitest";
import { createTestCV } from "../utils/create-test-cv";
import { prismaTest } from "../../lib/prismaTest";

describe("CvFormation model", () => {
	//? 4 tests pour le model CvFormation => 4 tests ok
	// model CvFormation {
	//   id          String @id @default(cuid())
	//   title       String
	//   organismeFormation String?
	//   start       DateTime
	//   end         DateTime?
	//   order       Int @default(0)
	//   cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//   cvId        String
	// }

	it("should create formation for CV", async () => {
		const { cv } = await createTestCV();
		const formation = await prismaTest.cvFormation.create({
			data: {
				title: "Formation 1",
				organismeFormation: "Organisme 1",
				order: 1,
				start: new Date(),
				end: new Date(),
				cvId: cv.id,
			},
		});
		expect(formation.title).toBe("Formation 1");
		expect(formation.organismeFormation).toBe("Organisme 1");
	});

	it("should not allow duplicate order in same CV", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvFormation.create({
			data: {
				title: "Formation 1",
				organismeFormation: "Organisme 1",
				order: 1,
				start: new Date(),
				end: new Date(),
				cvId: cv.id,
			},
		});
		await expect(
			prismaTest.cvFormation.create({
				data: {
					title: "Formation 2",
					organismeFormation: "Organisme 2",
					order: 1,
					start: new Date(),
					end: new Date(),
					cvId: cv.id,
				},
			}),
		).rejects.toThrow();
	});

	it("should allow same order in different CVs", async () => {
		const { cv: cv1 } = await createTestCV();
		const { cv: cv2 } = await createTestCV();
		await prismaTest.cvFormation.create({
			data: {
				title: "Formation 1",
				organismeFormation: "Organisme 1",
				start: new Date(),
				end: new Date(),
				order: 1,
				cvId: cv1.id,
			},
		});
		await prismaTest.cvFormation.create({
			data: {
				title: "Formation 1",
				organismeFormation: "Organisme 1",
				start: new Date(),
				end: new Date(),
				order: 1,
				cvId: cv2.id,
			},
		});
		const all = await prismaTest.cvFormation.findMany();
		expect(all.length).toBe(2);
	});

	it("should delete expertises when CV is deleted", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvFormation.create({
			data: {
				title: "Formation 1",
				organismeFormation: "Organisme 1",
				start: new Date(),
				end: new Date(),
				order: 1,
				cvId: cv.id,
			},
		});
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const remaining = await prismaTest.cvFormation.findMany({
			where: { cvId: cv.id },
		});
		expect(remaining.length).toBe(0);
	});
});
