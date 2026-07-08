import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestCV } from "../utils/create-test-cv";

describe("CvSocialMedia model", () => {
	//? 4 tests pour le model CvSocialMedia => 4 tests ok
	//   model CvSocialMedia {
	//     id            String @id @default(cuid())
	//     socialNetwork String
	//     username      String

	//     order         Int @default(0)
	//     cv            CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     cvId          String

	//     @@unique([cvId, socialNetwork])
	//     @@unique([cvId, order])
	//     @@index([cvId])
	//   }

	it("should create social media for CV", async () => {
		const { cv } = await createTestCV();
		const sm = await prismaTest.cvSocialMedia.create({
			data: {
				socialNetwork: "LinkedIn",
				username: "https://linkedin.com/me",
				order: 1,
				cvId: cv.id,
			},
		});
		expect(sm.socialNetwork).toBe("LinkedIn");
		expect(sm.username).toBe("https://linkedin.com/me");
	});

	it("should not allow duplicate order in same CV", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvSocialMedia.create({
			data: { socialNetwork: "LinkedIn", username: "a", order: 1, cvId: cv.id },
		});
		await expect(
			prismaTest.cvSocialMedia.create({
				data: {
					socialNetwork: "Twitter",
					username: "b",
					order: 1,
					cvId: cv.id,
				},
			}),
		).rejects.toThrow();
	});

	it("should allow same order in different CVs", async () => {
		const { cv: cv1 } = await createTestCV();
		const { cv: cv2 } = await createTestCV();
		await prismaTest.cvSocialMedia.create({
			data: {
				socialNetwork: "LinkedIn",
				username: "a",
				order: 1,
				cvId: cv1.id,
			},
		});
		await prismaTest.cvSocialMedia.create({
			data: {
				socialNetwork: "LinkedIn",
				username: "b",
				order: 1,
				cvId: cv2.id,
			},
		});
		const all = await prismaTest.cvSocialMedia.findMany();
		expect(all.length).toBe(2);
	});

	it("should delete social medias when CV is deleted", async () => {
		const { cv } = await createTestCV();
		await prismaTest.cvSocialMedia.create({
			data: { socialNetwork: "LinkedIn", username: "a", order: 1, cvId: cv.id },
		});
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const remaining = await prismaTest.cvSocialMedia.findMany({
			where: { cvId: cv.id },
		});
		expect(remaining.length).toBe(0);
	});
});
