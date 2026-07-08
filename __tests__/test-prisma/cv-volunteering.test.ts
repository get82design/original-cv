import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestCV } from "../utils/create-test-cv";

describe("CvVolunteering model", () => {
	//? 6 tests pour le model CvVolunteering => 6 tests ok
	//   model CvVolunteering {
	//     id          String @id @default(cuid())
	//     title       String
	//     organisation String
	//     description String?
	//     start       DateTime
	//     end         DateTime?
	//     location    String?
	//     cvMissions    CvMissionVolunteering[]

	//     order       Int @default(0)
	//     cv          CV @relation(fields: [cvId], references: [id], onDelete: Cascade)
	//     cvId        String

	//     @@unique([cvId, title])
	//     @@unique([cvId, order])
	//     @@index([cvId])
	//   }

	//   model CvMissionVolunteering {
	//     id          String      @id @default(cuid())
	//     content     String

	//     cvVolunteering  CvVolunteering  @relation(fields: [cvVolunteeringId], references: [id], onDelete: Cascade)
	//     cvVolunteeringId String

	//     @@index([cvVolunteeringId])
	//   }

	//! 1️⃣ CREATE
	describe("CREATE", () => {
		it("should create volunteering entry", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const volunteering = await prismaTest.cvVolunteering.create({
				data: {
					title: "Volunteer Teacher",
					organisation: "NGO",
					start: new Date("2022-01-01"),
					order: 1,
					cvId: cv.id,
				},
			});

			expect(volunteering.title).toBe("Volunteer Teacher");
			expect(volunteering.organisation).toBe("NGO");
		});

		it("should create volunteering with optional fields", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const volunteering = await prismaTest.cvVolunteering.create({
				data: {
					title: "Volunteer Dev",
					organisation: "OpenSource Org",
					description: "Helping community",
					start: new Date("2021-01-01"),
					end: new Date("2021-12-31"),
					location: "Remote",
					order: 2,
					cvId: cv.id,
				},
			});

			expect(volunteering.description).toBe("Helping community");
			expect(volunteering.location).toBe("Remote");
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

			await prismaTest.cvVolunteering.create({
				data: {
					title: "Volunteer",
					organisation: "Org1",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvVolunteering.create({
					data: {
						title: "Volunteer",
						organisation: "Org2",
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

			await prismaTest.cvVolunteering.create({
				data: {
					title: "V1",
					organisation: "Org1",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await expect(
				prismaTest.cvVolunteering.create({
					data: {
						title: "V2",
						organisation: "Org2",
						start: new Date(),
						order: 1,
						cvId: cv.id,
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3️⃣ RELATION MISSIONS
	describe("MISSIONS RELATION", () => {
		it("should create mission for volunteering", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const volunteering = await prismaTest.cvVolunteering.create({
				data: {
					title: "Volunteer",
					organisation: "Org",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			const mission = await prismaTest.cvMissionVolunteering.create({
				data: {
					content: "Organized events",
					cvVolunteeringId: volunteering.id,
				},
			});

			expect(mission.cvVolunteeringId).toBe(volunteering.id);
		});

		it("should delete missions when volunteering is deleted", async () => {
			const user = await createTestUser();
			const template = await createTestTemplate();
			const { cv } = await createTestCV(
				// @ts-expect-error
				{ userId: user.id, templateId: template.id },
			);

			const volunteering = await prismaTest.cvVolunteering.create({
				data: {
					title: "Volunteer",
					organisation: "Org",
					start: new Date(),
					order: 1,
					cvId: cv.id,
				},
			});

			await prismaTest.cvMissionVolunteering.create({
				data: {
					content: "Mission 1",
					cvVolunteeringId: volunteering.id,
				},
			});

			await prismaTest.cvVolunteering.delete({
				where: { id: volunteering.id },
			});

			const missions = await prismaTest.cvMissionVolunteering.findMany({
				where: { cvVolunteeringId: volunteering.id },
			});

			expect(missions.length).toBe(0);
		});
	});
});
