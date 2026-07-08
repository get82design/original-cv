import { describe, expect, it } from "vitest";
import { createTestCV } from "../utils/create-test-cv";
import { prismaTest } from "../../lib/prismaTest";

describe("CvPhilosophy model", () => {
	//? 3 tests pour le model CvPhilosophy => 3 tests ok
	// model CvPhilosophy {
	//   id          String @id @default(cuid())
	//   citation    String
	//   author      String?
	//   cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//   cvId        String @unique
	// }

	it("should create philosophy for CV", async () => {
		const { cv } = await createTestCV();
		const philo = await prismaTest.cvPhilosophy.create({
			data: {
				citation: "My personal philosophy",
				author: "John Doe",
				cvId: cv.id,
			},
		});
		expect(philo.citation).toBe("My personal philosophy");
		expect(philo.author).toBe("John Doe");
	});

	it("should not allow multiple philosophies for same CV", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvPhilosophy.create({
			data: { citation: "First", author: "John Doe", cvId: cv.id },
		});
		await expect(
			prismaTest.cvPhilosophy.create({
				data: { citation: "Second", author: "John Doe", cvId: cv.id },
			}),
		).rejects.toThrow();
	});

	it("should delete philosophy when CV is deleted", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvPhilosophy.create({
			data: { citation: "Philo", author: "John Doe", cvId: cv.id },
		});
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const remaining = await prismaTest.cvPhilosophy.findMany({
			where: { cvId: cv.id },
		});
		expect(remaining.length).toBe(0);
	});
});
