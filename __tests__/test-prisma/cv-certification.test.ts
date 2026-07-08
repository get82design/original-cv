import { describe, expect, it } from "vitest";
import { createTestCV } from "../utils/create-test-cv";
import { prismaTest } from "../../lib/prismaTest";

describe("CvCertification model", () => {
	//? 4 tests pour le model CvCertification => 4 tests ok
	// model CvCertification {
	//   id          String @id @default(cuid())
	//   title       String
	//   organismeCertification String?
	//   icon        String?
	//   order       Int @default(0)
	//   cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//   cvId        String
	// }

	it("should create certification for CV", async () => {
		const { cv } = await createTestCV();
		const certification = await prismaTest.cvCertification.create({
			data: {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
				cvId: cv.id,
			},
		});
		expect(certification.title).toBe("Certification 1");
		expect(certification.organismeCertification).toBe("Organisme 1");
	});

	it("should not allow duplicate order in same CV", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvCertification.create({
			data: {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
				cvId: cv.id,
			},
		});
		await expect(
			prismaTest.cvCertification.create({
				data: {
					title: "Certification 2",
					organismeCertification: "Organisme 2",
					order: 1,
					cvId: cv.id,
				},
			}),
		).rejects.toThrow();
	});

	it("should allow same order in different CVs", async () => {
		const { cv: cv1 } = await createTestCV();
		const { cv: cv2 } = await createTestCV();
		await prismaTest.cvCertification.create({
			data: {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
				cvId: cv1.id,
			},
		});
		await prismaTest.cvCertification.create({
			data: {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
				cvId: cv2.id,
			},
		});
		const all = await prismaTest.cvCertification.findMany();
		expect(all.length).toBe(2);
	});

	it("should delete expertises when CV is deleted", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvCertification.create({
			data: {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
				order: 1,
				cvId: cv.id,
			},
		});
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const remaining = await prismaTest.cvCertification.findMany({
			where: { cvId: cv.id },
		});
		expect(remaining.length).toBe(0);
	});
});
