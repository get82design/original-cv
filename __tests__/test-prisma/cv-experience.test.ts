import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestCV } from "../utils/create-test-cv";

describe("CvExperience & CvMissionExperience models", () => {
	//? 7 tests pour le model CvExperience & CvMissionExperience => 7 tests ok
	//   model CvExperience {
	//     id          String @id @default(cuid())
	//     title       String
	//     company     String
	//     start       DateTime
	//     end         DateTime?
	//     location    String?
	//     description String?
	//     cvMissions  CvMissionExperience[]

	//     order       Int @default(0)
	//     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     cvId        String

	//     @@unique([cvId, title])
	//     @@unique([cvId, order])
	//     @@index([cvId])
	//   }

	//   model CvMissionExperience {
	//     id          String      @id @default(cuid())
	//     content     String

	//     cvExperience  CvExperience  @relation(fields: [cvExperienceId], references: [id], onDelete: Cascade)
	//     cvExperienceId String

	//     @@index([cvExperienceId])
	//   }

	//! 1️⃣ CREATE TESTS
	describe("CREATE", () => {
		it("should create a CV experience", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const experience = await prismaTest.cvExperience.create({
				data: {
					title: "Frontend Developer",
					company: "Google",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			expect(experience.title).toBe("Frontend Developer");
			expect(experience.company).toBe("Google");
			expect(experience.cvId).toBe(cv.id);
		});

		it("should create missions for an experience", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const experience = await prismaTest.cvExperience.create({
				data: {
					title: "Backend Dev",
					company: "Amazon",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await prismaTest.cvMissionExperience.create({
				data: {
					content: "Developed APIs",
					cvExperienceId: experience.id,
				},
			});

			const missions = await prismaTest.cvMissionExperience.findMany({
				where: { cvExperienceId: experience.id },
			});

			expect(missions.length).toBe(1);
			expect(missions[0]!.content).toBe("Developed APIs");
		});
	});

	//! 2️⃣ UNIQUE CONSTRAINT TESTS
	describe("UNIQUE CONSTRAINTS", () => {
		it("should not allow duplicate title in same CV", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			await prismaTest.cvExperience.create({
				data: {
					title: "Dev",
					company: "Company A",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvExperience.create({
					data: {
						title: "Dev",
						company: "Company B",
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

			await prismaTest.cvExperience.create({
				data: {
					title: "Dev 1",
					company: "Company A",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvExperience.create({
					data: {
						title: "Dev 2",
						company: "Company B",
						start: new Date(),
						order: 1,
						cvId: cv.id,
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3️⃣ RELATIONS
	describe("RELATIONS", () => {
		it("should link missions to correct experience", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const experience = await prismaTest.cvExperience.create({
				data: {
					title: "Fullstack Dev",
					company: "Meta",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			const mission = await prismaTest.cvMissionExperience.create({
				data: {
					content: "Built scalable apps",
					cvExperienceId: experience.id,
				},
			});

			expect(mission.cvExperienceId).toBe(experience.id);
		});
	});

	//! 4️⃣ DELETE CASCADE
	describe("DELETE CASCADE", () => {
		it("should delete missions when experience is deleted", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const experience = await prismaTest.cvExperience.create({
				data: {
					title: "DevOps",
					company: "Netflix",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await prismaTest.cvMissionExperience.create({
				data: {
					content: "Managed CI/CD",
					cvExperienceId: experience.id,
				},
			});

			await prismaTest.cvExperience.delete({
				where: { id: experience.id },
			});

			const missions = await prismaTest.cvMissionExperience.findMany({
				where: { cvExperienceId: experience.id },
			});

			expect(missions.length).toBe(0);
		});

		it("should delete experiences when CV is deleted", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			await prismaTest.cvExperience.create({
				data: {
					title: "Dev",
					company: "Startup",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await prismaTest.cV.delete({
				where: { id: cv.id },
			});

			const experiences = await prismaTest.cvExperience.findMany({
				where: { cvId: cv.id },
			});

			expect(experiences.length).toBe(0);
		});
	});
});
