import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "../utils/create-test-user";

describe("CvTemplate model", () => {
	//? 9 tests pour le model CVTemplate => 9 tests ok
	//   model CVTemplate {
	//     id       String @id @default(cuid())
	//     name     String                              // nom du template
	//     structure    Json                            // structure du template (zones, sections)
	//     defaultStyles Json                           // styles par défaut (fontSize, color, align, show, etc.)
	//     cvs           CV[]                           // CVs utilisant ce template
	//   }

	//! 1- CREATE TESTS
	describe("CREATE", () => {
		// 1-1: créer un template de CV
		it("should create a CVTemplate", async () => {
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Modern",
					structure: { sections: ["header", "skills"] },
					defaultStyles: { fontSize: 12, color: "black" },
				},
			});

			expect(template.name).toBe("Modern");
			expect(template.structure).toEqual({ sections: ["header", "skills"] });
			expect(template.defaultStyles).toEqual({ fontSize: 12, color: "black" });
		});
	});

	//! 2- CREATE ERROR TESTS
	describe("CREATE ERRORS", () => {
		// 2-1: ne peut pas créer un template sans name
		it("should not create template without name", async () => {
			await expect(
				prismaTest.cVTemplate.create({
					// @ts-expect-error
					data: {
						structure: {},
						defaultStyles: {},
					},
				}),
			).rejects.toThrow();
		});

		// 2-2: ne peut pas créer un template sans structure
		it("should not create template without structure", async () => {
			await expect(
				prismaTest.cVTemplate.create({
					// @ts-expect-error
					data: {
						name: "Template 1",
						defaultStyles: { create: [] },
					},
				}),
			).rejects.toThrow();
		});

		// 2-3: ne peut pas créer un template sans defaultStyles
		it("should not create template without defaultStyles", async () => {
			await expect(
				prismaTest.cVTemplate.create({
					// @ts-expect-error
					data: {
						name: "Template 1",
						structure: { create: [] },
					},
				}),
			).rejects.toThrow();
		});
	});

	//! 3- UPDATE TESTS
	describe("UPDATE", () => {
		// 3-1: mettre à jour un template
		it("should update a CVTemplate", async () => {
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Modern",
					structure: { sections: ["header", "skills"] },
					defaultStyles: { fontSize: 12, color: "black" },
				},
			});
			const updated = await prismaTest.cVTemplate.update({
				where: { id: template.id },
				data: { name: "Modern 2" },
			});
			expect(updated.name).toBe("Modern 2");
			expect(updated.structure).toEqual({ sections: ["header", "skills"] });
			expect(updated.defaultStyles).toEqual({ fontSize: 12, color: "black" });
		});

		// 3-2: mettre à jour un template avec un structure partielle
		it("should update a CVTemplate with a partial structure", async () => {
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Modern",
					structure: { sections: ["header", "skills"] },
					defaultStyles: { fontSize: 12, color: "black" },
				},
			});
			const updated = await prismaTest.cVTemplate.update({
				where: { id: template.id },
				data: { structure: { sections: ["header"] } },
			});
			expect(updated.structure).toEqual({ sections: ["header"] });
			expect(updated.defaultStyles).toEqual({ fontSize: 12, color: "black" });
		});

		// 3-3: mettre à jour un template avec un defaultStyles partielle
		it("should update a CVTemplate with a partial defaultStyles", async () => {
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Modern",
					structure: { sections: ["header", "skills"] },
					defaultStyles: { fontSize: 12, color: "black" },
				},
			});
			const updated = await prismaTest.cVTemplate.update({
				where: { id: template.id },
				data: { defaultStyles: { fontSize: 14 } },
			});
			expect(updated.defaultStyles).toEqual({ fontSize: 14 });
			expect(updated.structure).toEqual({ sections: ["header", "skills"] });
		});
	});

	//! 4- DELETE TESTS
	describe("DELETE", () => {
		// 4-1: ne peut pas supprimer un template si un CV est lié
		it("should not delete template if linked CV exists", async () => {
			const user = await createTestUser();
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Modern",
					structure: {},
					defaultStyles: {},
				},
			});

			await prismaTest.cV.create({
				data: {
					title: "My CV",
					templateId: template.id,
					userId: user.id,
				},
			});

			await expect(
				prismaTest.cVTemplate.delete({
					where: { id: template.id },
				}),
			).rejects.toThrow();
		});
	});

	//! 5- RELATIONS TESTS
	describe("RELATIONS", () => {
		// 5-1: peut lier un template à des CVs
		it("should link template to correct cvs", async () => {
			const template = await prismaTest.cVTemplate.create({
				data: {
					name: "Modern",
					structure: {},
					defaultStyles: {},
				},
			});
			const user = await createTestUser();
			await prismaTest.cV.createMany({
				data: [
					{
						title: "My CV 1",
						templateId: template.id,
						userId: user.id,
					},
					{
						title: "My CV 2",
						templateId: template.id,
						userId: user.id,
					},
				],
			});
			const templateWithCvs = await prismaTest.cVTemplate.findUnique({
				where: { id: template.id },
				include: { cvs: true },
			});

			expect(templateWithCvs!.cvs.length).toBe(2);
		});
	});
});
